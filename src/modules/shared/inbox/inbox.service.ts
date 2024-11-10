import { Inject, Injectable } from '@nestjs/common';
import { InboxRepository } from './repositories/inbox.repository';
import {
  MessageHandlerErrorBehavior,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Inbox } from './entities/inbox.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Transactional } from '@nestjs-cls/transactional';
import { IMailerGateway } from '../../mailer/imailer-gateway.interface';
import { ITemplateGateway } from '../../mailer/itemplate-gateway.interface';

@Injectable()
export class InboxService {
  constructor(
    private readonly inboxRepository: InboxRepository,
    @Inject('TemplateGateway')
    private readonly templateGateway: ITemplateGateway,
    @Inject('MailerGateway')
    private readonly mailerGateway: IMailerGateway,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  @Transactional()
  async process() {
    const inboxMessages = await this.inboxRepository.findToProcess();
    for (const inboxMessage of inboxMessages) {
      let error: string;
      try {
        const html = await this.templateGateway.load({
          templateName: inboxMessage.payload.template,
          variables: inboxMessage.payload.variables,
        });
        await this.mailerGateway.sendEmail({
          html,
          to: inboxMessage.payload.to,
          subject: inboxMessage.payload.subject || 'Contato CityNexus',
        });
      } catch (err) {
        error = err.toString();
      }
      inboxMessage.error = error;
      inboxMessage.processedAt = new Date();
      await this.inboxRepository.save(inboxMessage);
    }
  }

  @RabbitSubscribe({
    exchange: 'person.registered',
    queue: 'person.registered.notifications',
    createQueueIfNotExists: true,
    queueOptions: {
      deadLetterExchange: 'dlq.person.registered',
      deadLetterRoutingKey: 'dlq.person.registered.notifications',
    },
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async saveInbox(input: {
    correlationId?: string;
    message: any;
    messageId: string;
  }) {
    const inbox = Inbox.create({
      eventName: 'person.registered.notifications',
      payload: input.message,
      messageId: input.messageId,
      correlationId: input.correlationId,
    });
    const existsByMessageId = await this.inboxRepository.existsByMessageId(
      inbox.messageId,
    );
    if (existsByMessageId) return;
    await this.inboxRepository.save(inbox);
  }
}

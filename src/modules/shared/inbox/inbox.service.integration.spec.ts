import { TransactionHost } from '@nestjs-cls/transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { AutoRollBackTransactionalAdapterTypeOrm } from 'src/infra/database/typeorm/transactional-adapter';
import { IntegrationTestHelpers } from 'src/modules/shared/test-helpers/integration/setup-test-container';
import { InboxService } from './inbox.service';
import { InboxRepository } from './repositories/inbox.repository';
import { uuidv7 } from 'uuidv7';
import { randomUUID } from 'crypto';
import { MailerModule } from '../../mailer/mailer.module';
import { Inbox } from './entities/inbox.entity';
import { ITemplateGateway } from '../../mailer/itemplate-gateway.interface';

const JestMailerGateway = {
  sendEmail: jest.fn(),
};

const JestTemplateGateway: ITemplateGateway = {
  load: jest.fn(),
};

describe('InboxService', () => {
  let sut: InboxService;
  let testingModule: TestingModule;

  let txHost: TransactionHost<AutoRollBackTransactionalAdapterTypeOrm>;
  IntegrationTestHelpers.setupTestContainer();

  afterEach(async () => {
    await testingModule.close();
  });
  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      imports: [
        ...IntegrationTestHelpers.registerDefaultModules(),
        MailerModule,
      ],
      providers: [InboxService, InboxRepository],
    })
      .overrideProvider('MailerGateway')
      .useValue(JestMailerGateway)
      .overrideProvider('JestTemplateGateway')
      .useValue(JestTemplateGateway)
      .compile();
    sut = await mod.get(InboxService);

    txHost = mod.get(TransactionHost);
    testingModule = mod;

    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Receive Message From the Broker - saveInbox', () => {
    test('When a message is received from the broker and the message is a new one, then should save it on database', async () => {
      await txHost.withTransaction(async () => {
        const messageId = uuidv7();
        await sut.saveInbox({
          messageId,
          message: {
            id: randomUUID(),
            to: 'jhon@email.com',
            strategy: 'email',
            template: 'welcome',
            variables: [],
          },
        });

        const [{ count }] = await txHost.tx.query(
          'select count(*) from inbox where message_id = $1',
          [messageId],
        );
        expect(Number(count)).toBe(1);
      });
    });

    test('When a message is received twice from the broker, only one of them should be saved', async () => {
      await txHost.withTransaction(async () => {
        const messageId = uuidv7();
        await sut.saveInbox({
          messageId,
          message: {
            id: randomUUID(),
            to: 'jhon@email.com',
            strategy: 'email',
            template: 'welcome',
            variables: [],
          },
        });
        await sut.saveInbox({
          messageId,
          message: {
            id: randomUUID(),
            to: 'jhon@email.com',
            strategy: 'email',
            template: 'welcome',
            variables: [],
          },
        });

        const [{ count }] = await txHost.tx.query(
          'select count(*) from inbox where message_id = $1',
          [messageId],
        );
        expect(Number(count)).toBe(1);
      });
    });

    test('When a message is received and it is with invalid payload, the message should be ignored', async () => {
      await txHost.withTransaction(async () => {
        const messageId = uuidv7();
        await expect(
          sut.saveInbox({
            messageId,
            message: {
              id: randomUUID(),
              variables: [],
            },
          }),
        ).rejects.toThrow();

        const [{ count }] = await txHost.tx.query(
          'select count(*) from inbox where message_id = $1',
          [messageId],
        );
        expect(Number(count)).toBe(0);
      });
    });
  });

  describe('Process Inbox Message -  processInboxMessages', () => {
    test('When there is no inbox messages to process should do nothing', async () => {
      await txHost.withTransaction(async () => {
        const mailerGateway = testingModule.get('MailerGateway');
        await sut.process();

        expect(mailerGateway.sendEmail).not.toHaveBeenCalled();
      });
    });

    test('When there is a inbox message to process, it should load the template and send  the email to the  customer', async () => {
      await txHost.withTransaction(async () => {
        const inboxMessage = Inbox.create({
          eventName: 'person.registered.notifications',
          messageId: randomUUID(),
          correlationId: null,
          payload: {
            id: randomUUID(),
            template: 'welcome',
            strategy: 'email',
            to: 'jhon@email.com',
            variables: [
              {
                name: 'name',
                value: 'Jhon Doe',
              },
              {
                name: 'email',
                value: 'jhon@email.com',
              },
            ],
          },
        });
        await txHost.tx.save(inboxMessage);
        const mailerGateway = testingModule.get('MailerGateway');
        const templateGateway = testingModule.get('TemplateGateway');

        templateGateway.load = jest
          .fn()
          .mockResolvedValue('<html lang="pt-br"><body></body></html>');

        await sut.process();

        expect(mailerGateway.sendEmail).toHaveBeenCalledWith({
          to: 'jhon@email.com',
          subject: expect.any(String),
          html: expect.any(String),
        });
        const inboxMessages = await txHost.tx.query('select * from inbox');
        inboxMessages.forEach((inboxMessage) => {
          expect(inboxMessage.processed_at).toBeTruthy();
        });
      });
    });

    test('When there are multiple inbox messages to process, but only one of them failed, the processed at must be filled for every inbox, and only the failed one should have the error column fileld', async () => {
      await txHost.withTransaction(async () => {
        const inboxMessage1 = Inbox.create({
          eventName: 'person.registered.notifications',
          messageId: uuidv7(),
          correlationId: null,
          payload: {
            id: randomUUID(),
            template: 'welcome',
            strategy: 'email',
            to: 'jhon@email.com',
            variables: [
              {
                name: 'name',
                value: 'Jhon Doe',
              },
              {
                name: 'email',
                value: 'jhon@email.com',
              },
            ],
          },
        });
        const inboxMessage2 = Inbox.create({
          eventName: 'person.registered.notifications',
          messageId: uuidv7(),
          correlationId: null,
          payload: {
            id: randomUUID(),
            template: 'welcome',
            strategy: 'email',
            to: 'jhon2@email.com',
            variables: [
              {
                name: 'name',
                value: 'Jhon Doe',
              },
              {
                name: 'email',
                value: 'jhon@email.com',
              },
            ],
          },
        });
        await txHost.tx.save([inboxMessage1, inboxMessage2]);
        const mailerGateway = testingModule.get('MailerGateway');
        const templateGateway = testingModule.get('TemplateGateway');
        let invokeTimes = 1;
        templateGateway.load = jest.fn().mockImplementation(() => {
          console.log(invokeTimes);
          if (invokeTimes == 2) throw new Error('Unknown error');
          invokeTimes++;
          return '<div></div>';
        });

        await sut.process();

        expect(mailerGateway.sendEmail).toHaveBeenCalledWith({
          to: 'jhon@email.com',
          subject: expect.any(String),
          html: expect.any(String),
        });
        const inboxMessages = await txHost.tx.query('select * from inbox');
        inboxMessages.forEach((inboxMessage) => {
          expect(inboxMessage.processed_at).toBeTruthy();
        });
        expect(inboxMessages.at(1).error).toBe('Error: Unknown error');
      });
    });
  });
});

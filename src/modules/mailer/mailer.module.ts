import { Module } from '@nestjs/common';
import { MailerGateway } from './services/mailer-gateway.service';
import { ReactEmailTemplateGatewayService } from './services/react-email-template-gateway.service';

@Module({
  providers: [
    {
      provide: 'MailerGateway',
      useClass: MailerGateway,
    },
    {
      provide: 'TemplateGateway',
      useClass: ReactEmailTemplateGatewayService,
    },
  ],
  exports: [
    { provide: 'MailerGateway', useClass: MailerGateway },
    {
      provide: 'TemplateGateway',
      useClass: ReactEmailTemplateGatewayService,
    },
  ],
})
export class MailerModule {}

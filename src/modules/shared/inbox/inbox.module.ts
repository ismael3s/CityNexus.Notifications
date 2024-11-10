import { Module } from '@nestjs/common';
import { InboxRepository } from './repositories/inbox.repository';
import { InboxService } from './inbox.service';
import { MailerModule } from '../../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  providers: [InboxRepository, InboxService],
  exports: [InboxRepository],
})
export class InboxModule {}

import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Inbox } from '../entities/inbox.entity';
import { Equal } from 'typeorm';

@Injectable()
export class InboxRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  private get repository() {
    return this.txHost.tx.getRepository(Inbox);
  }

  public async save(inbox: Inbox): Promise<void> {
    await this.repository.save(inbox);
  }

  public async existsByMessageId(messageId: string): Promise<boolean> {
    return this.repository.existsBy({
      messageId: Equal(messageId),
    });
  }

  public async findToProcess() {
    return this.repository
      .createQueryBuilder('inbox')
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .where('inbox.processedAt IS NULL')
      .getMany();
  }
}

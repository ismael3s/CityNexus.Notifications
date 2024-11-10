import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { uuidv7 } from 'uuidv7';

@Entity()
export class Outbox {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  processedAt?: Date;

  @Column({
    type: 'jsonb',
  })
  payload: any;

  @Column()
  event: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  private constructor() {}

  static fromEvent(event: string, payload: any) {
    const outbox = new Outbox();
    outbox.id = uuidv7();
    outbox.event = event;
    outbox.payload = payload;
    outbox.createdAt = new Date();
    return outbox;
  }
}

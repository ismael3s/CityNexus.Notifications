import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { z } from 'zod';

const variableSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const payloadSchema = z.object({
  to: z.string(),
  template: z.enum(['welcome']),
  strategy: z.enum(['email', 'phone']),
  subject: z.string().optional().nullable(),
  variables: z.array(variableSchema),
});

type Payload = z.infer<typeof payloadSchema>;

@Entity()
export class Inbox {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @Column({
    unique: true,
    type: 'uuid',
  })
  messageId: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  correlationId?: string;

  @Column()
  eventName: string;

  @Column({ type: 'jsonb' })
  payload: Payload;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  processedAt?: Date;

  @Column({
    nullable: true,
  })
  error?: string;

  static create(input: {
    eventName: string;
    payload: any;
    messageId: string;
    correlationId?: string;
  }) {
    const inbox = new Inbox();
    inbox.id = uuidv7();
    inbox.eventName = input.eventName;
    inbox.messageId = input.messageId;
    payloadSchema.parse(input.payload);
    inbox.correlationId = input.correlationId;
    inbox.payload = input.payload;
    inbox.createdAt = new Date();
    return inbox;
  }
}

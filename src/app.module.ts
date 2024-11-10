import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { databaseConfig } from './infra/configs/database';
import { HealthModule } from './modules/shared/health/health.module';
import { OutboxModule } from './modules/shared/outbox/outbox.module';
import { TimersModule } from './modules/shared/timers/timers.module';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { InboxModule } from './modules/shared/inbox/inbox.module';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'person.registered',
          type: 'fanout',
          createExchangeIfNotExists: true,
          options: {
            'x-dead-letter-exchange': 'dlq.person.registered',
          },
        },

        {
          name: 'dlq.person.registered',
          type: 'direct',
          createExchangeIfNotExists: true,
        },
      ],
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [TypeOrmModule],
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: getDataSourceToken(),
          }),
        }),
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    OutboxModule,
    TimersModule,
    HealthModule,
    MailerModule,
    InboxModule,
  ],
})
export class AppModule {}

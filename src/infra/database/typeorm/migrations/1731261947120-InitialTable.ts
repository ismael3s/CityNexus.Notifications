import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTable1731261947120 implements MigrationInterface {
  name = 'InitialTable1731261947120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "outbox" ("id" uuid NOT NULL, "processed_at" TIMESTAMP WITH TIME ZONE, "payload" jsonb NOT NULL, "event" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "inbox" ("id" uuid NOT NULL, "message_id" uuid NOT NULL, "correlation_id" uuid, "event_name" character varying NOT NULL, "payload" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "processed_at" TIMESTAMP WITH TIME ZONE, "error" character varying, CONSTRAINT "UQ_bbd15267b116fd3c45f459a65fa" UNIQUE ("message_id"), CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inbox"`);
    await queryRunner.query(`DROP TABLE "outbox"`);
  }
}

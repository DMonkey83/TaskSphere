import { MigrationInterface, QueryRunner } from "typeorm";

export class Onboarding1749823999861 implements MigrationInterface {
    name = 'Onboarding1749823999861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "onboarding_drafts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "completed" boolean NOT NULL DEFAULT false, "data" jsonb NOT NULL, CONSTRAINT "REL_d5f11ff13aabc363815b435920" UNIQUE ("user_id"), CONSTRAINT "PK_8e59a03cf261a7807fc9a0c1cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2cbbed537c59255337c5960698" ON "onboarding_drafts" ("completed") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d5f11ff13aabc363815b435920" ON "onboarding_drafts" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "onboarding_step" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "has_completed_onboarding" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "onboarding_draft_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_d23e48a69829db2657f7bf7d04c" UNIQUE ("onboarding_draft_id")`);
        await queryRunner.query(`ALTER TABLE "onboarding_drafts" ADD CONSTRAINT "FK_d5f11ff13aabc363815b435920a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d23e48a69829db2657f7bf7d04c" FOREIGN KEY ("onboarding_draft_id") REFERENCES "onboarding_drafts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d23e48a69829db2657f7bf7d04c"`);
        await queryRunner.query(`ALTER TABLE "onboarding_drafts" DROP CONSTRAINT "FK_d5f11ff13aabc363815b435920a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_d23e48a69829db2657f7bf7d04c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboarding_draft_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "has_completed_onboarding"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboarding_step"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5f11ff13aabc363815b435920"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cbbed537c59255337c5960698"`);
        await queryRunner.query(`DROP TABLE "onboarding_drafts"`);
    }

}

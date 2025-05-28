import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamsUpdate1748356122802 implements MigrationInterface {
    name = 'TeamsUpdate1748356122802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team_members_users" ("teamId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_e899eb8f5b9ddd47130a1d4ee1a" PRIMARY KEY ("teamId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c78f3a075638c7be7a3afe233e" ON "team_members_users" ("teamId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a855d5fc719779fe932d768351" ON "team_members_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "team" ADD "accountId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_811aba5f3d476db71e160be3d79" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_members_users" ADD CONSTRAINT "FK_c78f3a075638c7be7a3afe233e6" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "team_members_users" ADD CONSTRAINT "FK_a855d5fc719779fe932d7683519" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team_members_users" DROP CONSTRAINT "FK_a855d5fc719779fe932d7683519"`);
        await queryRunner.query(`ALTER TABLE "team_members_users" DROP CONSTRAINT "FK_c78f3a075638c7be7a3afe233e6"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_811aba5f3d476db71e160be3d79"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "accountId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a855d5fc719779fe932d768351"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c78f3a075638c7be7a3afe233e"`);
        await queryRunner.query(`DROP TABLE "team_members_users"`);
    }

}

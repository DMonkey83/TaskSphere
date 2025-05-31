import { MigrationInterface, QueryRunner } from 'typeorm';

export class Teams1747163329833 implements MigrationInterface {
  name = 'Teams1747163329833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectId" uuid, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_teams_team" ("usersId" uuid NOT NULL, "teamId" uuid NOT NULL, CONSTRAINT "PK_096f99173e30e1183a05bc4949c" PRIMARY KEY ("usersId", "teamId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90b9f667db2161053fbaaff0b3" ON "users_teams_team" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_482bcf983d5a5c92f43420b6d5" ON "users_teams_team" ("teamId") `,
    );
    await queryRunner.query(`ALTER TABLE "project" ADD "teamsId" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "teamId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_2defea9edb26358ff53c172ee28" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_103ad72ec3e027bfd1d768242ac" FOREIGN KEY ("teamsId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d" FOREIGN KEY ("teamId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_teams_team" ADD CONSTRAINT "FK_90b9f667db2161053fbaaff0b3f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_teams_team" ADD CONSTRAINT "FK_482bcf983d5a5c92f43420b6d5c" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_teams_team" DROP CONSTRAINT "FK_482bcf983d5a5c92f43420b6d5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_teams_team" DROP CONSTRAINT "FK_90b9f667db2161053fbaaff0b3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_103ad72ec3e027bfd1d768242ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_2defea9edb26358ff53c172ee28"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "teamId"`);
    await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "teamsId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_482bcf983d5a5c92f43420b6d5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90b9f667db2161053fbaaff0b3"`,
    );
    await queryRunner.query(`DROP TABLE "users_teams_team"`);
    await queryRunner.query(`DROP TABLE "team"`);
  }
}

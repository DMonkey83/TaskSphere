import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tasks1747162048249 implements MigrationInterface {
  name = 'Tasks1747162048249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_relations" ("taskId" uuid NOT NULL, "relatedTaskId" uuid NOT NULL, CONSTRAINT "PK_856df4d59da5f05100cab663d6a" PRIMARY KEY ("taskId", "relatedTaskId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a4c25ccf040b077a02ce8be167" ON "task_relations" ("taskId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7b26fcdcb3cb999acc4338410" ON "task_relations" ("relatedTaskId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "type" character varying NOT NULL DEFAULT 'subtask'`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "creatorId" uuid`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "parentId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_90bc62e96b48a437a78593f78f0" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085" FOREIGN KEY ("parentId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" ADD CONSTRAINT "FK_a4c25ccf040b077a02ce8be1675" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" ADD CONSTRAINT "FK_f7b26fcdcb3cb999acc4338410c" FOREIGN KEY ("relatedTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_relations" DROP CONSTRAINT "FK_f7b26fcdcb3cb999acc4338410c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" DROP CONSTRAINT "FK_a4c25ccf040b077a02ce8be1675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_90bc62e96b48a437a78593f78f0"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "creatorId"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "type"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7b26fcdcb3cb999acc4338410"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4c25ccf040b077a02ce8be167"`,
    );
    await queryRunner.query(`DROP TABLE "task_relations"`);
  }
}

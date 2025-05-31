import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixedTypos1747573767285 implements MigrationInterface {
  name = 'FixedTypos1747573767285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_61c463cd40a985a0f1b8319a94a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" RENAME COLUMN "asigneeId" TO "assigneeId"`,
    );
    await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "tag" ADD "color" character varying`);
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "color"`);
    await queryRunner.query(`ALTER TABLE "tag" ADD "color" boolean`);
    await queryRunner.query(
      `ALTER TABLE "tasks" RENAME COLUMN "assigneeId" TO "asigneeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_61c463cd40a985a0f1b8319a94a" FOREIGN KEY ("asigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

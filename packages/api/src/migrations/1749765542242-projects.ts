import { MigrationInterface, QueryRunner } from 'typeorm';

export class Projects1749765542242 implements MigrationInterface {
  name = 'Projects1749765542242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "update_at" TO "updated_at"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "updated_at" TO "update_at"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class FirstTimeLoginFieldUser1749847271426
  implements MigrationInterface
{
  name = 'FirstTimeLoginFieldUser1749847271426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "first_login_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_login_at"`);
  }
}

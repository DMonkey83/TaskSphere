import { MigrationInterface, QueryRunner } from "typeorm";

export class Refreshtoken1748736037143 implements MigrationInterface {
    name = 'Refreshtoken1748736037143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME COLUMN "tokenHash" TO "token"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME COLUMN "token" TO "tokenHash"`);
    }

}

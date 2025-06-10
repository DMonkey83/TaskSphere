import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectUpdate11749582909618 implements MigrationInterface {
    name = 'ProjectUpdate11749582909618'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_2defea9edb26358ff53c172ee28"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_103ad72ec3e027bfd1d768242ac"`);
        await queryRunner.query(`CREATE TABLE "project_teams_team" ("projectId" uuid NOT NULL, "teamId" uuid NOT NULL, CONSTRAINT "PK_cd2b83dd2c39ca5da0ae0d66ab1" PRIMARY KEY ("projectId", "teamId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a7d311f774c34b41ec18ed14f5" ON "project_teams_team" ("projectId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6f617c3f27c84b38c8e35837ff" ON "project_teams_team" ("teamId") `);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "projectId"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "teamsId"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "planningType"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "slug" character varying`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_6fce32ddd71197807027be6ad38" UNIQUE ("slug")`);
        await queryRunner.query(`CREATE TYPE "public"."project_workflow_enum" AS ENUM('kanban', 'scrum', 'timeline', 'calendar', 'checklist')`);
        await queryRunner.query(`ALTER TABLE "project" ADD "workflow" "public"."project_workflow_enum" NOT NULL DEFAULT 'kanban'`);
        await queryRunner.query(`ALTER TABLE "project" ADD "config" jsonb`);
        await queryRunner.query(`ALTER TABLE "project" ADD "archived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "project" ADD "visibility" character varying`);
        await queryRunner.query(`ALTER TABLE "project" ADD "tags" text array`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "industry"`);
        await queryRunner.query(`CREATE TYPE "public"."project_industry_enum" AS ENUM('programming', 'legal', 'logistics', 'marketing', 'product', 'other')`);
        await queryRunner.query(`ALTER TABLE "project" ADD "industry" "public"."project_industry_enum"`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_03b8ae50e8e05fd3334802d84e0" UNIQUE ("accountId", "slug")`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "UQ_1371753fc3e2a309eea64fbb103" UNIQUE ("accountId", "projectKey")`);
        await queryRunner.query(`ALTER TABLE "project_teams_team" ADD CONSTRAINT "FK_a7d311f774c34b41ec18ed14f52" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "project_teams_team" ADD CONSTRAINT "FK_6f617c3f27c84b38c8e35837ff7" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_teams_team" DROP CONSTRAINT "FK_6f617c3f27c84b38c8e35837ff7"`);
        await queryRunner.query(`ALTER TABLE "project_teams_team" DROP CONSTRAINT "FK_a7d311f774c34b41ec18ed14f52"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_1371753fc3e2a309eea64fbb103"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_03b8ae50e8e05fd3334802d84e0"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "industry"`);
        await queryRunner.query(`DROP TYPE "public"."project_industry_enum"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "industry" character varying`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "tags"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "visibility"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "archived"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "config"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "workflow"`);
        await queryRunner.query(`DROP TYPE "public"."project_workflow_enum"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "UQ_6fce32ddd71197807027be6ad38"`);
        await queryRunner.query(`ALTER TABLE "project" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "project" ADD "planningType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project" ADD "teamsId" uuid`);
        await queryRunner.query(`ALTER TABLE "team" ADD "projectId" uuid`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f617c3f27c84b38c8e35837ff"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a7d311f774c34b41ec18ed14f5"`);
        await queryRunner.query(`DROP TABLE "project_teams_team"`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_103ad72ec3e027bfd1d768242ac" FOREIGN KEY ("teamsId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_2defea9edb26358ff53c172ee28" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

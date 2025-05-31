import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtraFields1747497648819 implements MigrationInterface {
  name = 'ExtraFields1747497648819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "attachment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying NOT NULL, "fileUrl" character varying NOT NULL, "fileType" character varying NOT NULL, "fileSize" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "uploadedById" uuid, CONSTRAINT "PK_d2a80c3a8d467f08a750ac4b420" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "authorId" uuid, "parentCommentId" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" boolean, CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "field" character varying, "oldValue" character varying, "newValue" character varying, "crated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "userId" uuid, CONSTRAINT "PK_a8f24c7952c9ff5533f88279941" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_tracking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hours" double precision NOT NULL, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workDate" date NOT NULL, "taskId" uuid, "userId" uuid, CONSTRAINT "PK_47d84cfac233244d3924cfdac37" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag_tasks_tasks" ("tagId" uuid NOT NULL, "tasksId" uuid NOT NULL, CONSTRAINT "PK_9d1a1455d91d36f9fc79059a21e" PRIMARY KEY ("tagId", "tasksId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d60b92b71b1e1f31e66abbe694" ON "tag_tasks_tasks" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2064cbcf44582c43abac996d2a" ON "tag_tasks_tasks" ("tasksId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks_tags_tag" ("tasksId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_f85294648ceb605a0f5fa01fb5d" PRIMARY KEY ("tasksId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e956bf1e5f84518b9979bd1792" ON "tasks_tags_tag" ("tasksId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19bda941e254f4579123f4a1e8" ON "tasks_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_611282e10752b2ecbd5c8525ab5" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_53bee183febd17739e30539bebe" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_73aac6035a70c5f0313c939f237" FOREIGN KEY ("parentCommentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_fea29116442682a99fa5fa4ab32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_tracking" ADD CONSTRAINT "FK_09251fce7d3915239be6158430d" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_tracking" ADD CONSTRAINT "FK_d0dcb549fa1963cca98bccc257f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_tasks_tasks" ADD CONSTRAINT "FK_d60b92b71b1e1f31e66abbe694b" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_tasks_tasks" ADD CONSTRAINT "FK_2064cbcf44582c43abac996d2a8" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_tag" ADD CONSTRAINT "FK_e956bf1e5f84518b9979bd17922" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_tag" ADD CONSTRAINT "FK_19bda941e254f4579123f4a1e8e" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_tag" DROP CONSTRAINT "FK_19bda941e254f4579123f4a1e8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_tag" DROP CONSTRAINT "FK_e956bf1e5f84518b9979bd17922"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_tasks_tasks" DROP CONSTRAINT "FK_2064cbcf44582c43abac996d2a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tag_tasks_tasks" DROP CONSTRAINT "FK_d60b92b71b1e1f31e66abbe694b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_tracking" DROP CONSTRAINT "FK_d0dcb549fa1963cca98bccc257f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_tracking" DROP CONSTRAINT "FK_09251fce7d3915239be6158430d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_fea29116442682a99fa5fa4ab32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_73aac6035a70c5f0313c939f237"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" DROP CONSTRAINT "FK_53bee183febd17739e30539bebe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachment" DROP CONSTRAINT "FK_611282e10752b2ecbd5c8525ab5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_19bda941e254f4579123f4a1e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e956bf1e5f84518b9979bd1792"`,
    );
    await queryRunner.query(`DROP TABLE "tasks_tags_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2064cbcf44582c43abac996d2a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d60b92b71b1e1f31e66abbe694"`,
    );
    await queryRunner.query(`DROP TABLE "tag_tasks_tasks"`);
    await queryRunner.query(`DROP TABLE "time_tracking"`);
    await queryRunner.query(`DROP TABLE "task_activity"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(`DROP TABLE "attachment"`);
  }
}

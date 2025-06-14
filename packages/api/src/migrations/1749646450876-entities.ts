import { MigrationInterface, QueryRunner } from 'typeorm';

export class Entities1749646450876 implements MigrationInterface {
  name = 'Entities1749646450876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2db43cdbf7bb862e577b5f540c8" UNIQUE ("name"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "accountId" uuid NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying NOT NULL, "fileUrl" character varying NOT NULL, "fileType" character varying NOT NULL, "fileSize" bigint NOT NULL, "mimeType" character varying, "isPublic" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "task_id" uuid, "uploaded_by_id" uuid NOT NULL, CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_70a38fc450d3b433c86b67e69d" ON "attachments" ("uploaded_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e62fd181b97caa6b150b09220b" ON "attachments" ("task_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "authorId" uuid, "parentCommentId" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "isActive" boolean, "color" character varying, "accountId" uuid NOT NULL, CONSTRAINT "UQ_2b7f6d79d1bc2822c16feabe586" UNIQUE ("name"), CONSTRAINT "PK_7b47a7628547c0976415988d3cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0295ddcf8dbd2996bf906d04f5" ON "task_tags" ("name", "accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ecbaa4f4f1c14519182d8333ae" ON "task_tags" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "task_activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "field" character varying, "oldValue" character varying, "newValue" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "userId" uuid, CONSTRAINT "PK_a8f24c7952c9ff5533f88279941" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_trackings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hours" numeric(10,2) NOT NULL DEFAULT '0', "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workDate" date NOT NULL, "task_id" uuid, "user_id" uuid NOT NULL, CONSTRAINT "PK_4de4afc2b62a49c8badf8defb05" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e17330186abd1eaae651f6c113" ON "time_trackings" ("task_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f273b36c6f8680099717821c43" ON "time_trackings" ("user_id", "workDate") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "taskKey" character varying NOT NULL, "description" character varying, "type" character varying NOT NULL DEFAULT 'subtask', "status" character varying NOT NULL DEFAULT 'todo', "priority" character varying NOT NULL DEFAULT 'medium', "dueDate" TIMESTAMP WITH TIME ZONE, "storyPoints" integer, "billableHours" integer, "deliveryAddress" character varying, "deliveryWindow" tstzrange, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectId" uuid, "assigneeId" uuid, "creatorId" uuid, "teamId" uuid, "parentId" uuid, CONSTRAINT "UQ_d3b09dfe42e32a456e6d587b21a" UNIQUE ("taskKey"), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c300d154a85801889174e92a3d" ON "tasks" ("dueDate") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectKey" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "industry" "public"."project_industry_enum", "slug" character varying, "workflow" "public"."project_workflow_enum" NOT NULL DEFAULT 'kanban', "status" "public"."project_status_enum" NOT NULL DEFAULT 'planned', "startDate" TIMESTAMP, "endDate" TIMESTAMP, "matterNumber" character varying, "config" jsonb, "archived" boolean NOT NULL DEFAULT false, "visibility" character varying, "tags" text array, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "accountId" uuid, "ownerId" uuid, CONSTRAINT "UQ_6fce32ddd71197807027be6ad38" UNIQUE ("slug"), CONSTRAINT "UQ_03b8ae50e8e05fd3334802d84e0" UNIQUE ("accountId", "slug"), CONSTRAINT "UQ_1371753fc3e2a309eea64fbb103" UNIQUE ("accountId", "projectKey"), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d8f72dfe86073bf0ac5115e7dd" ON "project" ("projectKey") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6fce32ddd71197807027be6ad3" ON "project" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe3738d4fb224ea68f13ef43a2" ON "project" ("archived") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9884b2ee80eb70b7db4f12e8ae" ON "project" ("ownerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7ba4988e406692345e46faec0f" ON "project" ("accountId", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."project_members_role_enum" NOT NULL DEFAULT 'member', "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, "project_id" uuid, CONSTRAINT "UQ_b3f491d3a3f986106d281d8eb4b" UNIQUE ("user_id", "project_id"), CONSTRAINT "PK_0b2f46f804be4aea9234c78bcc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e89aae80e010c2faa72e6a49ce" ON "project_members" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5729113570c20c7e214cf3f58" ON "project_members" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'member', "is_email_verified" boolean NOT NULL DEFAULT false, "mfa_enabled" boolean NOT NULL DEFAULT false, "mfa_secret" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "account_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6132610e59f1890e60780d660" ON "users" ("account_id", "email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roadmap" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ownerId" uuid, CONSTRAINT "PK_8652e486587a4e35070c86d2232" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roadmap_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "dependencies" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "roadmapId" uuid, "projectId" uuid, "taskId" uuid, CONSTRAINT "PK_e5d959c8ec2deabd242d10e640e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project-views" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "viewType" character varying NOT NULL, "configuration" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectId" uuid, CONSTRAINT "PK_6849722d03b6124a961da5febbf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "phone" character varying, "address" character varying, "industry" "public"."customers_industry_enum", "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "account_id" uuid NOT NULL, "createdById" uuid, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ebcc29963874e55053e8ee80be" ON "customers" ("account_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "content" character varying NOT NULL, "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid, "taskId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77ee7b06d6f802000c0846f3a5" ON "notifications" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92f5d3a7779be163cbea7916c6" ON "notifications" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c0c710fa8182fe57bf0fd9d610" ON "notifications" ("customerId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileSize" bigint, "mimeType" character varying, "description" text, "fileName" character varying NOT NULL, "filePath" character varying NOT NULL, "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "project_id" uuid, "taskId" uuid, "uploaded_by_id" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_02306fdd7023e63532159eefb3" ON "documents" ("uploaded_by_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6a19efc163a9cdd2248719382" ON "documents" ("taskId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e156b298c20873e14c362e789b" ON "documents" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "client_portal_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'viewer', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid, "projectId" uuid, CONSTRAINT "UQ_52af61c69c075a299d79a5acb4d" UNIQUE ("accessToken"), CONSTRAINT "PK_cf03ca6fc12aaa3e74e1e4293df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "revoked" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" "public"."account_invites_role_enum" NOT NULL, "status" "public"."account_invites_status_enum" NOT NULL DEFAULT 'pending', "token" character varying NOT NULL, "accepted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "account_id" uuid, CONSTRAINT "UQ_93082695065dfb8bf3e7c5ad92d" UNIQUE ("token"), CONSTRAINT "PK_7f0826bdc4c2883624a745acd4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55ab38828dc33450f3452d8b08" ON "account_invites" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_93082695065dfb8bf3e7c5ad92" ON "account_invites" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8be1fbba5113d5e639fb796aea" ON "account_invites" ("email", "account_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "team_members_users" ("teamId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_e899eb8f5b9ddd47130a1d4ee1a" PRIMARY KEY ("teamId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c78f3a075638c7be7a3afe233e" ON "team_members_users" ("teamId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a855d5fc719779fe932d768351" ON "team_members_users" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "task_tags_tasks_tasks" ("taskTagsId" uuid NOT NULL, "tasksId" uuid NOT NULL, CONSTRAINT "PK_56e1df1158bb0a32ccba48b6a87" PRIMARY KEY ("taskTagsId", "tasksId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97b139c262a3651fa74aab5fd6" ON "task_tags_tasks_tasks" ("taskTagsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69ee58e96478789725b0c228a1" ON "task_tags_tasks_tasks" ("tasksId") `,
    );
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
      `CREATE TABLE "tasks_tags_task_tags" ("tasksId" uuid NOT NULL, "taskTagsId" uuid NOT NULL, CONSTRAINT "PK_222d14ac6418c1ef089f8c78f2a" PRIMARY KEY ("tasksId", "taskTagsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_daff75d5c66f52b7f28d2f8292" ON "tasks_tags_task_tags" ("tasksId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3664e944de8b5790cad9062e5" ON "tasks_tags_task_tags" ("taskTagsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "project_teams_team" ("projectId" uuid NOT NULL, "teamId" uuid NOT NULL, CONSTRAINT "PK_cd2b83dd2c39ca5da0ae0d66ab1" PRIMARY KEY ("projectId", "teamId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7d311f774c34b41ec18ed14f5" ON "project_teams_team" ("projectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f617c3f27c84b38c8e35837ff" ON "project_teams_team" ("teamId") `,
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
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_811aba5f3d476db71e160be3d79" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_e62fd181b97caa6b150b09220b1" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_70a38fc450d3b433c86b67e69d6" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "task_tags" ADD CONSTRAINT "FK_ecbaa4f4f1c14519182d8333ae9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" ADD CONSTRAINT "FK_fea29116442682a99fa5fa4ab32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_trackings" ADD CONSTRAINT "FK_e17330186abd1eaae651f6c1139" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_trackings" ADD CONSTRAINT "FK_96e8f764e599e3ac4e7725d479c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_90bc62e96b48a437a78593f78f0" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085" FOREIGN KEY ("parentId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_8d691f8d69acef59f4ed3a872c4" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_b5729113570c20c7e214cf3f58d" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_17a709b8b6146c491e6615c29d7" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap" ADD CONSTRAINT "FK_91045a4b42e58e8d1bbceb92774" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_096692657f905f1a832079b5f8d" FOREIGN KEY ("roadmapId") REFERENCES "roadmap"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_cb0807d7e85a91032893b41cda0" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" ADD CONSTRAINT "FK_73e811ddc14983b9176ab7a8582" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project-views" ADD CONSTRAINT "FK_b95c3010b741df677236fef475f" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_ebcc29963874e55053e8ee80be5" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_aa88a28eac26e514147fc7d2039" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_c0c710fa8182fe57bf0fd9d6104" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_ec4858ee62e0008aaa1dcb95c8f" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_e156b298c20873e14c362e789bf" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_f6a19efc163a9cdd22487193826" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_02306fdd7023e63532159eefb3c" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_portal_access" ADD CONSTRAINT "FK_6feaa7cfa4c1f841cba59b392b6" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_portal_access" ADD CONSTRAINT "FK_21b1f758eb6eea7b98cf6c7c648" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_invites" ADD CONSTRAINT "FK_24116967f8fab70b752213d260b" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_users" ADD CONSTRAINT "FK_c78f3a075638c7be7a3afe233e6" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_users" ADD CONSTRAINT "FK_a855d5fc719779fe932d7683519" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tags_tasks_tasks" ADD CONSTRAINT "FK_97b139c262a3651fa74aab5fd63" FOREIGN KEY ("taskTagsId") REFERENCES "task_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tags_tasks_tasks" ADD CONSTRAINT "FK_69ee58e96478789725b0c228a11" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" ADD CONSTRAINT "FK_a4c25ccf040b077a02ce8be1675" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" ADD CONSTRAINT "FK_f7b26fcdcb3cb999acc4338410c" FOREIGN KEY ("relatedTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_task_tags" ADD CONSTRAINT "FK_daff75d5c66f52b7f28d2f8292b" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_task_tags" ADD CONSTRAINT "FK_c3664e944de8b5790cad9062e50" FOREIGN KEY ("taskTagsId") REFERENCES "task_tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_teams_team" ADD CONSTRAINT "FK_a7d311f774c34b41ec18ed14f52" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_teams_team" ADD CONSTRAINT "FK_6f617c3f27c84b38c8e35837ff7" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "project_teams_team" DROP CONSTRAINT "FK_6f617c3f27c84b38c8e35837ff7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_teams_team" DROP CONSTRAINT "FK_a7d311f774c34b41ec18ed14f52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_task_tags" DROP CONSTRAINT "FK_c3664e944de8b5790cad9062e50"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks_tags_task_tags" DROP CONSTRAINT "FK_daff75d5c66f52b7f28d2f8292b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" DROP CONSTRAINT "FK_f7b26fcdcb3cb999acc4338410c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_relations" DROP CONSTRAINT "FK_a4c25ccf040b077a02ce8be1675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tags_tasks_tasks" DROP CONSTRAINT "FK_69ee58e96478789725b0c228a11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tags_tasks_tasks" DROP CONSTRAINT "FK_97b139c262a3651fa74aab5fd63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_users" DROP CONSTRAINT "FK_a855d5fc719779fe932d7683519"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members_users" DROP CONSTRAINT "FK_c78f3a075638c7be7a3afe233e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_invites" DROP CONSTRAINT "FK_24116967f8fab70b752213d260b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_portal_access" DROP CONSTRAINT "FK_21b1f758eb6eea7b98cf6c7c648"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_portal_access" DROP CONSTRAINT "FK_6feaa7cfa4c1f841cba59b392b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_02306fdd7023e63532159eefb3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_f6a19efc163a9cdd22487193826"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_e156b298c20873e14c362e789bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_ec4858ee62e0008aaa1dcb95c8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_c0c710fa8182fe57bf0fd9d6104"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_aa88a28eac26e514147fc7d2039"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_ebcc29963874e55053e8ee80be5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project-views" DROP CONSTRAINT "FK_b95c3010b741df677236fef475f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_73e811ddc14983b9176ab7a8582"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_cb0807d7e85a91032893b41cda0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap_items" DROP CONSTRAINT "FK_096692657f905f1a832079b5f8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roadmap" DROP CONSTRAINT "FK_91045a4b42e58e8d1bbceb92774"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_17a709b8b6146c491e6615c29d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_b5729113570c20c7e214cf3f58d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_8d691f8d69acef59f4ed3a872c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_90bc62e96b48a437a78593f78f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_trackings" DROP CONSTRAINT "FK_96e8f764e599e3ac4e7725d479c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_trackings" DROP CONSTRAINT "FK_e17330186abd1eaae651f6c1139"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_fea29116442682a99fa5fa4ab32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_activity" DROP CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_tags" DROP CONSTRAINT "FK_ecbaa4f4f1c14519182d8333ae9"`,
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
      `ALTER TABLE "attachments" DROP CONSTRAINT "FK_70a38fc450d3b433c86b67e69d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP CONSTRAINT "FK_e62fd181b97caa6b150b09220b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_811aba5f3d476db71e160be3d79"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_482bcf983d5a5c92f43420b6d5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90b9f667db2161053fbaaff0b3"`,
    );
    await queryRunner.query(`DROP TABLE "users_teams_team"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f617c3f27c84b38c8e35837ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7d311f774c34b41ec18ed14f5"`,
    );
    await queryRunner.query(`DROP TABLE "project_teams_team"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3664e944de8b5790cad9062e5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_daff75d5c66f52b7f28d2f8292"`,
    );
    await queryRunner.query(`DROP TABLE "tasks_tags_task_tags"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7b26fcdcb3cb999acc4338410"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a4c25ccf040b077a02ce8be167"`,
    );
    await queryRunner.query(`DROP TABLE "task_relations"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_69ee58e96478789725b0c228a1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97b139c262a3651fa74aab5fd6"`,
    );
    await queryRunner.query(`DROP TABLE "task_tags_tasks_tasks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a855d5fc719779fe932d768351"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c78f3a075638c7be7a3afe233e"`,
    );
    await queryRunner.query(`DROP TABLE "team_members_users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8be1fbba5113d5e639fb796aea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_93082695065dfb8bf3e7c5ad92"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55ab38828dc33450f3452d8b08"`,
    );
    await queryRunner.query(`DROP TABLE "account_invites"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "client_portal_access"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e156b298c20873e14c362e789b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f6a19efc163a9cdd2248719382"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_02306fdd7023e63532159eefb3"`,
    );
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c0c710fa8182fe57bf0fd9d610"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_92f5d3a7779be163cbea7916c6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_77ee7b06d6f802000c0846f3a5"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ebcc29963874e55053e8ee80be"`,
    );
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "project-views"`);
    await queryRunner.query(`DROP TABLE "roadmap_items"`);
    await queryRunner.query(`DROP TABLE "roadmap"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a6132610e59f1890e60780d660"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5729113570c20c7e214cf3f58"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e89aae80e010c2faa72e6a49ce"`,
    );
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7ba4988e406692345e46faec0f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9884b2ee80eb70b7db4f12e8ae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe3738d4fb224ea68f13ef43a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6fce32ddd71197807027be6ad3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d8f72dfe86073bf0ac5115e7dd"`,
    );
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c300d154a85801889174e92a3d"`,
    );
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f273b36c6f8680099717821c43"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e17330186abd1eaae651f6c113"`,
    );
    await queryRunner.query(`DROP TABLE "time_trackings"`);
    await queryRunner.query(`DROP TABLE "task_activity"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ecbaa4f4f1c14519182d8333ae"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0295ddcf8dbd2996bf906d04f5"`,
    );
    await queryRunner.query(`DROP TABLE "task_tags"`);
    await queryRunner.query(`DROP TABLE "comment"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e62fd181b97caa6b150b09220b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_70a38fc450d3b433c86b67e69d"`,
    );
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
  }
}

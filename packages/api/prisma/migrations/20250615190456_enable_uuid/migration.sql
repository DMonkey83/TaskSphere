CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CreateEnum
CREATE TYPE "account_invites_role_enum" AS ENUM ('owner', 'admin', 'project_manager', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "account_invites_status_enum" AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "customers_industry_enum" AS ENUM ('programming', 'legal', 'logistics', 'marketing', 'product', 'other');

-- CreateEnum
CREATE TYPE "notifications_status_enum" AS ENUM ('pending', 'sent', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "task_relations_type_enum" AS ENUM ('cloned_from', 'blocked_by', 'depends_on', 'blocking');

-- CreateEnum
CREATE TYPE "notifications_type_enum" AS ENUM ('task_assigned', 'task_updated', 'task_commented', 'task_overdue', 'task_completed', 'project_updated');

-- CreateEnum
CREATE TYPE "project_industry_enum" AS ENUM ('programming', 'legal', 'logistics', 'marketing', 'product', 'other');

-- CreateEnum
CREATE TYPE "project_members_role_enum" AS ENUM ('owner', 'admin', 'project_manager', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "project_status_enum" AS ENUM ('planned', 'in-progress', 'on-hold', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "project_workflow_enum" AS ENUM ('kanban', 'scrum', 'timeline', 'calendar', 'checklist');

-- CreateEnum
CREATE TYPE "users_role_enum" AS ENUM ('owner', 'admin', 'project_manager', 'member', 'viewer');

-- CreateTable
CREATE TABLE "account-invites" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR NOT NULL,
    "role" "account_invites_role_enum" NOT NULL,
    "status" "account_invites_status_enum" NOT NULL DEFAULT 'pending',
    "token" VARCHAR NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "accountId" UUID,

    CONSTRAINT "PK_7f0826bdc4c2883624a745acd4e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "fileName" VARCHAR NOT NULL,
    "fileUrl" VARCHAR NOT NULL,
    "fileType" VARCHAR NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "mimeType" VARCHAR,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" UUID,
    "uploadedById" UUID NOT NULL,

    CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client-portal-access" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "accessToken" VARCHAR NOT NULL,
    "role" VARCHAR NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" UUID,
    "projectId" UUID,

    CONSTRAINT "PK_cf03ca6fc12aaa3e74e1e4293df" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "content" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" UUID,
    "authorId" UUID,
    "parentCommentId" UUID,

    CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "email" VARCHAR,
    "phone" VARCHAR,
    "address" VARCHAR,
    "industry" "customers_industry_enum",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID NOT NULL,
    "createdById" UUID,

    CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "fileSize" BIGINT,
    "mimeType" VARCHAR,
    "description" TEXT,
    "fileName" VARCHAR NOT NULL,
    "filePath" VARCHAR NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" UUID,
    "taskId" UUID,
    "uploadedById" UUID,

    CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type" "notifications_type_enum" NOT NULL,
    "content" VARCHAR NOT NULL,
    "status" "notifications_status_enum" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" UUID,
    "taskId" UUID,

    CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding-drafts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL,

    CONSTRAINT "PK_8e59a03cf261a7807fc9a0c1cb7" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "projectKey" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "industry" "project_industry_enum",
    "slug" VARCHAR,
    "workflow" "project_workflow_enum" NOT NULL DEFAULT 'kanban',
    "status" "project_status_enum" NOT NULL DEFAULT 'planned',
    "startDate" TIMESTAMP(6),
    "endDate" TIMESTAMP(6),
    "matterNumber" VARCHAR,
    "config" JSONB,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "visibility" VARCHAR,
    "tags" TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID,
    "ownerId" UUID,

    CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project-views" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "viewType" VARCHAR NOT NULL,
    "configuration" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" UUID,

    CONSTRAINT "PK_6849722d03b6124a961da5febbf" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project-members" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role" "project_members_role_enum" NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,
    "projectId" UUID,

    CONSTRAINT "PK_0b2f46f804be4aea9234c78bcc9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project-teams-team" (
    "projectId" UUID NOT NULL,
    "teamId" UUID NOT NULL,

    CONSTRAINT "PK_cd2b83dd2c39ca5da0ae0d66ab1" PRIMARY KEY ("projectId","teamId")
);

-- CreateTable
CREATE TABLE "refresh-tokens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "token" VARCHAR NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID,

    CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" UUID,

    CONSTRAINT "PK_8652e486587a4e35070c86d2232" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap-items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "startDate" TIMESTAMPTZ(6),
    "endDate" TIMESTAMPTZ(6),
    "dependencies" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roadmapId" UUID,
    "projectId" UUID,
    "taskId" UUID,

    CONSTRAINT "PK_e5d959c8ec2deabd242d10e640e" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task-activity" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "action" VARCHAR NOT NULL,
    "field" VARCHAR,
    "oldValue" VARCHAR,
    "newValue" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" UUID,
    "userId" UUID,

    CONSTRAINT "PK_a8f24c7952c9ff5533f88279941" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task-relations" (
    "taskId" UUID NOT NULL,
    "relatedTaskId" UUID NOT NULL,
    "relationType" "task_relations_type_enum" NOT NULL DEFAULT 'cloned_from',

    CONSTRAINT "PK_856df4d59da5f05100cab663d6a" PRIMARY KEY ("taskId","relatedTaskId")
);

-- CreateTable
CREATE TABLE "task_statuses" (
    "id" UUID NOT NULL,
    "code" VARCHAR NOT NULL,
    "label" VARCHAR NOT NULL,
    "color" VARCHAR,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "task_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_status_logs" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "location" VARCHAR,
    "updatedById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task-tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN,
    "color" VARCHAR,
    "accountId" UUID NOT NULL,

    CONSTRAINT "PK_7b47a7628547c0976415988d3cb" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task-tags-tasks-tasks" (
    "taskTagsId" UUID NOT NULL,
    "tasksId" UUID NOT NULL,

    CONSTRAINT "PK_56e1df1158bb0a32ccba48b6a87" PRIMARY KEY ("taskTagsId","tasksId")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR NOT NULL,
    "taskKey" VARCHAR NOT NULL,
    "description" VARCHAR,
    "type" VARCHAR NOT NULL DEFAULT 'subtask',
    "priority" VARCHAR NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMPTZ(6),
    "storyPoints" INTEGER,
    "billableHours" INTEGER,
    "deliveryAddress" VARCHAR,
    "deliveryWindow" tstzrange,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusId" UUID,
    "projectId" UUID,
    "assigneeId" UUID,
    "creatorId" UUID,
    "teamId" UUID,
    "parentId" UUID,

    CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks-tags-task-tags" (
    "tasksId" UUID NOT NULL,
    "taskTagsId" UUID NOT NULL,

    CONSTRAINT "PK_222d14ac6418c1ef089f8c78f2a" PRIMARY KEY ("tasksId","taskTagsId")
);

-- CreateTable
CREATE TABLE "team" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "description" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID NOT NULL,

    CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team-members-users" (
    "teamId" UUID NOT NULL,
    "usersId" UUID NOT NULL,

    CONSTRAINT "PK_e899eb8f5b9ddd47130a1d4ee1a" PRIMARY KEY ("teamId","usersId")
);

-- CreateTable
CREATE TABLE "time-trackings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "description" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workDate" DATE NOT NULL,
    "taskId" UUID,
    "userId" UUID NOT NULL,

    CONSTRAINT "PK_4de4afc2b62a49c8badf8defb05" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR NOT NULL,
    "passwordHash" VARCHAR NOT NULL,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "role" "users_role_enum" NOT NULL DEFAULT 'member',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" UUID,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDraftId" UUID,
    "firstLoginAt" TIMESTAMPTZ(6),

    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users-teams-team" (
    "usersId" UUID NOT NULL,
    "teamId" UUID NOT NULL,

    CONSTRAINT "PK_096f99173e30e1183a05bc4949c" PRIMARY KEY ("usersId","teamId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_93082695065dfb8bf3e7c5ad92d" ON "account-invites"("token");

-- CreateIndex
CREATE INDEX "IDX_55ab38828dc33450f3452d8b08" ON "account-invites"("expiresAt");

-- CreateIndex
CREATE INDEX "IDX_8be1fbba5113d5e639fb796aea" ON "account-invites"("email", "accountId");

-- CreateIndex
CREATE INDEX "IDX_93082695065dfb8bf3e7c5ad92" ON "account-invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_2db43cdbf7bb862e577b5f540c8" ON "accounts"("name");

-- CreateIndex
CREATE INDEX "IDX_70a38fc450d3b433c86b67e69d" ON "attachments"("uploadedById");

-- CreateIndex
CREATE INDEX "IDX_e62fd181b97caa6b150b09220b" ON "attachments"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_52af61c69c075a299d79a5acb4d" ON "client-portal-access"("accessToken");

-- CreateIndex
CREATE INDEX "IDX_ebcc29963874e55053e8ee80be" ON "customers"("accountId");

-- CreateIndex
CREATE INDEX "IDX_02306fdd7023e63532159eefb3" ON "documents"("uploadedById");

-- CreateIndex
CREATE INDEX "IDX_e156b298c20873e14c362e789b" ON "documents"("projectId");

-- CreateIndex
CREATE INDEX "IDX_f6a19efc163a9cdd2248719382" ON "documents"("taskId");

-- CreateIndex
CREATE INDEX "IDX_77ee7b06d6f802000c0846f3a5" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "IDX_92f5d3a7779be163cbea7916c6" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "IDX_c0c710fa8182fe57bf0fd9d610" ON "notifications"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_d5f11ff13aabc363815b435920" ON "onboarding-drafts"("userId");

-- CreateIndex
CREATE INDEX "IDX_2cbbed537c59255337c5960698" ON "onboarding-drafts"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_6fce32ddd71197807027be6ad38" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "IDX_6fce32ddd71197807027be6ad3" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "IDX_7ba4988e406692345e46faec0f" ON "projects"("accountId", "status");

-- CreateIndex
CREATE INDEX "IDX_9884b2ee80eb70b7db4f12e8ae" ON "projects"("ownerId");

-- CreateIndex
CREATE INDEX "IDX_d8f72dfe86073bf0ac5115e7dd" ON "projects"("projectKey");

-- CreateIndex
CREATE INDEX "IDX_fe3738d4fb224ea68f13ef43a2" ON "projects"("archived");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_03b8ae50e8e05fd3334802d84e0" ON "projects"("accountId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_1371753fc3e2a309eea64fbb103" ON "projects"("accountId", "projectKey");

-- CreateIndex
CREATE INDEX "IDX_b5729113570c20c7e214cf3f58" ON "project-members"("projectId");

-- CreateIndex
CREATE INDEX "IDX_e89aae80e010c2faa72e6a49ce" ON "project-members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_b3f491d3a3f986106d281d8eb4b" ON "project-members"("userId", "projectId");

-- CreateIndex
CREATE INDEX "IDX_6f617c3f27c84b38c8e35837ff" ON "project-teams-team"("teamId");

-- CreateIndex
CREATE INDEX "IDX_a7d311f774c34b41ec18ed14f5" ON "project-teams-team"("projectId");

-- CreateIndex
CREATE INDEX "IDX_a4c25ccf040b077a02ce8be167" ON "task-relations"("taskId");

-- CreateIndex
CREATE INDEX "IDX_f7b26fcdcb3cb999acc4338410" ON "task-relations"("relatedTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "task_statuses_code_key" ON "task_statuses"("code");

-- CreateIndex
CREATE INDEX "IDX_task_status_active" ON "task_statuses"("isActive");

-- CreateIndex
CREATE INDEX "IDX_task_status_order" ON "task_statuses"("order");

-- CreateIndex
CREATE INDEX "IDX_task_log_task" ON "task_status_logs"("taskId");

-- CreateIndex
CREATE INDEX "IDX_task_log_status" ON "task_status_logs"("statusId");

-- CreateIndex
CREATE INDEX "IDX_task_log_updated_by" ON "task_status_logs"("updatedById");

-- CreateIndex
CREATE INDEX "IDX_task_log_created_at" ON "task_status_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_2b7f6d79d1bc2822c16feabe586" ON "task-tags"("name");

-- CreateIndex
CREATE INDEX "IDX_0295ddcf8dbd2996bf906d04f5" ON "task-tags"("name", "accountId");

-- CreateIndex
CREATE INDEX "IDX_ecbaa4f4f1c14519182d8333ae" ON "task-tags"("accountId");

-- CreateIndex
CREATE INDEX "IDX_69ee58e96478789725b0c228a1" ON "task-tags-tasks-tasks"("tasksId");

-- CreateIndex
CREATE INDEX "IDX_97b139c262a3651fa74aab5fd6" ON "task-tags-tasks-tasks"("taskTagsId");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_d3b09dfe42e32a456e6d587b21a" ON "tasks"("taskKey");

-- CreateIndex
CREATE INDEX "IDX_c300d154a85801889174e92a3d" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "IDX_c3664e944de8b5790cad9062e5" ON "tasks-tags-task-tags"("taskTagsId");

-- CreateIndex
CREATE INDEX "IDX_daff75d5c66f52b7f28d2f8292" ON "tasks-tags-task-tags"("tasksId");

-- CreateIndex
CREATE INDEX "IDX_a855d5fc719779fe932d768351" ON "team-members-users"("usersId");

-- CreateIndex
CREATE INDEX "IDX_c78f3a075638c7be7a3afe233e" ON "team-members-users"("teamId");

-- CreateIndex
CREATE INDEX "IDX_e17330186abd1eaae651f6c113" ON "time-trackings"("taskId");

-- CreateIndex
CREATE INDEX "IDX_f273b36c6f8680099717821c43" ON "time-trackings"("userId", "workDate");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_97672ac88f789774dd47f7c8be3" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_d23e48a69829db2657f7bf7d04c" ON "users"("onboardingDraftId");

-- CreateIndex
CREATE INDEX "IDX_a6132610e59f1890e60780d660" ON "users"("accountId", "email");

-- CreateIndex
CREATE INDEX "IDX_482bcf983d5a5c92f43420b6d5" ON "users-teams-team"("teamId");

-- CreateIndex
CREATE INDEX "IDX_90b9f667db2161053fbaaff0b3" ON "users-teams-team"("usersId");

-- AddForeignKey
ALTER TABLE "account-invites" ADD CONSTRAINT "FK_24116967f8fab70b752213d260b" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "FK_70a38fc450d3b433c86b67e69d6" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "FK_e62fd181b97caa6b150b09220b1" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client-portal-access" ADD CONSTRAINT "FK_21b1f758eb6eea7b98cf6c7c648" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client-portal-access" ADD CONSTRAINT "FK_6feaa7cfa4c1f841cba59b392b6" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "FK_73aac6035a70c5f0313c939f237" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "FK_9fc19c95c33ef4d97d09b72ee95" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "FK_aa88a28eac26e514147fc7d2039" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "FK_ebcc29963874e55053e8ee80be5" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "FK_02306fdd7023e63532159eefb3c" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "FK_e156b298c20873e14c362e789bf" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "FK_f6a19efc163a9cdd22487193826" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "FK_c0c710fa8182fe57bf0fd9d6104" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "FK_ec4858ee62e0008aaa1dcb95c8f" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "onboarding-drafts" ADD CONSTRAINT "FK_d5f11ff13aabc363815b435920a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "FK_8d691f8d69acef59f4ed3a872c4" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project-views" ADD CONSTRAINT "FK_b95c3010b741df677236fef475f" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project-members" ADD CONSTRAINT "FK_b5729113570c20c7e214cf3f58d" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project-members" ADD CONSTRAINT "FK_e89aae80e010c2faa72e6a49ce8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project-teams-team" ADD CONSTRAINT "FK_6f617c3f27c84b38c8e35837ff7" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project-teams-team" ADD CONSTRAINT "FK_a7d311f774c34b41ec18ed14f52" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh-tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "FK_91045a4b42e58e8d1bbceb92774" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmap-items" ADD CONSTRAINT "FK_096692657f905f1a832079b5f8d" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmap-items" ADD CONSTRAINT "FK_73e811ddc14983b9176ab7a8582" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "roadmap-items" ADD CONSTRAINT "FK_cb0807d7e85a91032893b41cda0" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task-activity" ADD CONSTRAINT "FK_dd4d1f026f618e434d9254c0d68" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task-activity" ADD CONSTRAINT "FK_fea29116442682a99fa5fa4ab32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task-relations" ADD CONSTRAINT "FK_a4c25ccf040b077a02ce8be1675" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task-relations" ADD CONSTRAINT "FK_f7b26fcdcb3cb999acc4338410c" FOREIGN KEY ("relatedTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_status_logs" ADD CONSTRAINT "task_status_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_status_logs" ADD CONSTRAINT "task_status_logs_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "task_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_status_logs" ADD CONSTRAINT "task_status_logs_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task-tags" ADD CONSTRAINT "FK_ecbaa4f4f1c14519182d8333ae9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task-tags-tasks-tasks" ADD CONSTRAINT "FK_69ee58e96478789725b0c228a11" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task-tags-tasks-tasks" ADD CONSTRAINT "FK_97b139c262a3651fa74aab5fd63" FOREIGN KEY ("taskTagsId") REFERENCES "task-tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "FK_12c5f5304c7d7c4deb27046671d" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "FK_1cbec65196d4cf86dd8ab464085" FOREIGN KEY ("parentId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "FK_90bc62e96b48a437a78593f78f0" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "task_statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks-tags-task-tags" ADD CONSTRAINT "FK_c3664e944de8b5790cad9062e50" FOREIGN KEY ("taskTagsId") REFERENCES "task-tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tasks-tags-task-tags" ADD CONSTRAINT "FK_daff75d5c66f52b7f28d2f8292b" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "FK_811aba5f3d476db71e160be3d79" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team-members-users" ADD CONSTRAINT "FK_a855d5fc719779fe932d7683519" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "team-members-users" ADD CONSTRAINT "FK_c78f3a075638c7be7a3afe233e6" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time-trackings" ADD CONSTRAINT "FK_96e8f764e599e3ac4e7725d479c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "time-trackings" ADD CONSTRAINT "FK_e17330186abd1eaae651f6c1139" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "FK_17a709b8b6146c491e6615c29d7" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "FK_d23e48a69829db2657f7bf7d04c" FOREIGN KEY ("onboardingDraftId") REFERENCES "onboarding-drafts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users-teams-team" ADD CONSTRAINT "FK_482bcf983d5a5c92f43420b6d5c" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users-teams-team" ADD CONSTRAINT "FK_90b9f667db2161053fbaaff0b3f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

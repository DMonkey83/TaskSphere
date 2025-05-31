import { MigrationInterface, QueryRunner } from 'typeorm';

export class Database1746535510037 implements MigrationInterface {
  name = 'Database1746535510037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "industry" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2db43cdbf7bb862e577b5f540c8" UNIQUE ("name"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "projectKey" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "industry" character varying, "planningType" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'planned', "startDate" TIMESTAMP, "endDate" TIMESTAMP, "matterNumber" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "update_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "accountId" uuid, "ownerId" uuid, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying NOT NULL, "userId" uuid, "projectId" uuid, CONSTRAINT "PK_0b2f46f804be4aea9234c78bcc9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('owner', 'admin', 'user', 'project_manager')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "is_email_verified" boolean NOT NULL DEFAULT false, "mfa_enabled" boolean NOT NULL DEFAULT false, "mfa_secret" character varying NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "accountId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "taskKey" character varying NOT NULL, "description" character varying, "status" character varying NOT NULL DEFAULT 'todo', "priority" character varying NOT NULL DEFAULT 'medium', "dueDate" TIMESTAMP WITH TIME ZONE, "storyPoints" integer, "billableHours" integer, "deliveryAddress" character varying, "deliveryWindow" tstzrange, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectId" uuid, "asigneeId" uuid, CONSTRAINT "UQ_d3b09dfe42e32a456e6d587b21a" UNIQUE ("taskKey"), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "phone" character varying, "address" character varying, "industry" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdById" uuid, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "content" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid, "taskId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying NOT NULL, "filePath" character varying NOT NULL, "version" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "projectId" uuid, "taskId" uuid, "uploadedById" uuid, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "client_portal_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'viewer', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "customerId" uuid, "projectId" uuid, CONSTRAINT "UQ_52af61c69c075a299d79a5acb4d" UNIQUE ("accessToken"), CONSTRAINT "PK_cf03ca6fc12aaa3e74e1e4293df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "revoked" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" character varying, "token" character varying NOT NULL, "accepted" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "account_id" uuid, CONSTRAINT "UQ_e7debfb39db480942d35519b7eb" UNIQUE ("token"), CONSTRAINT "PK_17260c0c2afc7c3821cbcacf0cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_8d691f8d69acef59f4ed3a872c4" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_08d1346ff91abba68e5a637cfdb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" ADD CONSTRAINT "FK_d19892d8f03928e5bfc7313780c" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_42bba679e348de51a699fb0a803" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_61c463cd40a985a0f1b8319a94a" FOREIGN KEY ("asigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_aa88a28eac26e514147fc7d2039" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_c0c710fa8182fe57bf0fd9d6104" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_ec4858ee62e0008aaa1dcb95c8f" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_fe6ebd6e679c0feee3a7ecc0354" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_f6a19efc163a9cdd22487193826" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD CONSTRAINT "FK_5aad3bc717a4f483887ec61dbc8" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "account_invite" ADD CONSTRAINT "FK_5d1309556736623139fc8c0ccd8" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_invite" DROP CONSTRAINT "FK_5d1309556736623139fc8c0ccd8"`,
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
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_5aad3bc717a4f483887ec61dbc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_f6a19efc163a9cdd22487193826"`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" DROP CONSTRAINT "FK_fe6ebd6e679c0feee3a7ecc0354"`,
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
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_61c463cd40a985a0f1b8319a94a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_42bba679e348de51a699fb0a803"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_d19892d8f03928e5bfc7313780c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_members" DROP CONSTRAINT "FK_08d1346ff91abba68e5a637cfdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_9884b2ee80eb70b7db4f12e8aed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_8d691f8d69acef59f4ed3a872c4"`,
    );
    await queryRunner.query(`DROP TABLE "account_invite"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "client_portal_access"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "project-views"`);
    await queryRunner.query(`DROP TABLE "roadmap_items"`);
    await queryRunner.query(`DROP TABLE "roadmap"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(`DROP TABLE "project"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
  }
}

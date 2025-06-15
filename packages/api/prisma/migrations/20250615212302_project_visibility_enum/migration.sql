/*
  Warnings:

  - The `visibility` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "projects_visibility_enum" AS ENUM ('private', 'team', 'account');

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "projects_visibility_enum" NOT NULL DEFAULT 'private';

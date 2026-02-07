/*
  Warnings:

  - Added the required column `updatedAt` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."AdminProfile" ALTER COLUMN "organization" SET DEFAULT 'PES Modern College of Engineering';

-- AlterTable
ALTER TABLE "public"."JobPost" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."JobStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

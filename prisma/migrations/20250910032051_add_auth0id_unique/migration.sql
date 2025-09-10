/*
  Warnings:

  - A unique constraint covering the columns `[auth0Id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."StudentProfile" ALTER COLUMN "personalEmail" DROP NOT NULL,
ALTER COLUMN "phoneNo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_auth0Id_key" ON "public"."User"("auth0Id");

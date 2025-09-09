/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNo` on the `User` table. All the data in the column will be lost.
  - Added the required column `personalEmail` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth0Id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StudentProfile" ADD COLUMN     "personalEmail" TEXT NOT NULL,
ADD COLUMN     "phoneNo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "password",
DROP COLUMN "phoneNo",
ADD COLUMN     "auth0Id" TEXT NOT NULL;

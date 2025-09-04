/*
  Warnings:

  - You are about to drop the column `backlogs` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `branch` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `cgpa` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `diplomaPercent` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `diplomaYear` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentYear` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `passingYear` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tenthPercent` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tenthYear` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `twelfthPercent` on the `StudentProfile` table. All the data in the column will be lost.
  - You are about to drop the column `twelfthYear` on the `StudentProfile` table. All the data in the column will be lost.
  - Added the required column `phoneNo` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StudentProfile" DROP COLUMN "backlogs",
DROP COLUMN "branch",
DROP COLUMN "cgpa",
DROP COLUMN "diplomaPercent",
DROP COLUMN "diplomaYear",
DROP COLUMN "enrollmentYear",
DROP COLUMN "passingYear",
DROP COLUMN "phone",
DROP COLUMN "tenthPercent",
DROP COLUMN "tenthYear",
DROP COLUMN "twelfthPercent",
DROP COLUMN "twelfthYear";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phoneNo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "enrollmentYear" INTEGER NOT NULL,
    "passingYear" INTEGER,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "tenthPercent" DOUBLE PRECISION,
    "tenthYear" INTEGER,
    "twelfthPercent" DOUBLE PRECISION,
    "twelfthYear" INTEGER,
    "diplomaPercent" DOUBLE PRECISION,
    "diplomaYear" INTEGER,
    "backlogs" INTEGER NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Education_studentId_key" ON "public"."Education"("studentId");

-- AddForeignKey
ALTER TABLE "public"."Education" ADD CONSTRAINT "Education_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

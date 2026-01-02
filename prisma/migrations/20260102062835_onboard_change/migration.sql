-- CreateEnum
CREATE TYPE "public"."OnboardingStep" AS ENUM ('PROFILE', 'EDUCATION', 'COMPLETED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "onboardingStep" "public"."OnboardingStep" NOT NULL DEFAULT 'PROFILE';

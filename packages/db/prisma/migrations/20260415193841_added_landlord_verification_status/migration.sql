-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "landlord" ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeOrganizationId" TEXT;

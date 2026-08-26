-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles';

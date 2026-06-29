-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#38bdf8',
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "emailReports" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pushAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleTitle" TEXT,
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'SYSTEM';

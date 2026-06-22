-- CreateEnum
CREATE TYPE "MarketplaceConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'NEEDS_ATTENTION');

-- CreateEnum
CREATE TYPE "MarketplaceSyncMode" AS ENUM ('MOCK', 'API');

-- AlterTable
ALTER TABLE "marketplaces" ADD COLUMN     "externalAccountId" TEXT,
ADD COLUMN     "lastSyncAt" TIMESTAMP(3),
ADD COLUMN     "status" "MarketplaceConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
ADD COLUMN     "syncMode" "MarketplaceSyncMode" NOT NULL DEFAULT 'MOCK';

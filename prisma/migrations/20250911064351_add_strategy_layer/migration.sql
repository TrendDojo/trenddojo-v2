-- AlterTable
ALTER TABLE "public"."trades" ADD COLUMN     "strategyId" TEXT;

-- CreateTable
CREATE TABLE "public"."strategies" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "type" TEXT,
    "allocationAmount" DECIMAL(15,2),
    "allocationPercent" DECIMAL(5,2),
    "maxPositions" INTEGER NOT NULL DEFAULT 5,
    "maxRiskPerPosition" DECIMAL(5,2) DEFAULT 2.0,
    "maxDrawdown" DECIMAL(5,2) DEFAULT 10.0,
    "entryRules" JSONB,
    "exitRules" JSONB,
    "positionSizingRules" JSONB,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winningTrades" INTEGER NOT NULL DEFAULT 0,
    "losingTrades" INTEGER NOT NULL DEFAULT 0,
    "totalPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalPnlPercent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "avgWin" DECIMAL(15,2),
    "avgLoss" DECIMAL(15,2),
    "winRate" DECIMAL(5,2),
    "profitFactor" DECIMAL(5,2),
    "sharpeRatio" DECIMAL(5,2),
    "lastCalculated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "strategies_accountId_idx" ON "public"."strategies"("accountId");

-- CreateIndex
CREATE INDEX "strategies_status_idx" ON "public"."strategies"("status");

-- CreateIndex
CREATE INDEX "strategies_createdAt_idx" ON "public"."strategies"("createdAt");

-- CreateIndex
CREATE INDEX "trades_strategyId_idx" ON "public"."trades"("strategyId");

-- AddForeignKey
ALTER TABLE "public"."strategies" ADD CONSTRAINT "strategies_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "public"."strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

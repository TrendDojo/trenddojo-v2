-- CreateTable for Strategy (non-breaking addition)
CREATE TABLE "strategies" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'closed', 'testing'
    "type" TEXT, -- 'momentum', 'mean_reversion', 'breakout', 'swing', 'scalp'
    
    -- Allocation and Risk
    "allocationAmount" DECIMAL(15,2),
    "allocationPercent" DECIMAL(5,2),
    "maxPositions" INTEGER NOT NULL DEFAULT 5,
    "maxRiskPerPosition" DECIMAL(5,2) DEFAULT 2.0,
    "maxDrawdown" DECIMAL(5,2) DEFAULT 10.0,
    
    -- Rules Configuration (JSON for flexibility)
    "entryRules" JSONB,
    "exitRules" JSONB,
    "positionSizingRules" JSONB,
    
    -- Performance Tracking
    "totalTrades" INTEGER DEFAULT 0,
    "winningTrades" INTEGER DEFAULT 0,
    "losingTrades" INTEGER DEFAULT 0,
    "totalPnl" DECIMAL(15,2) DEFAULT 0,
    "totalPnlPercent" DECIMAL(10,2) DEFAULT 0,
    "avgWin" DECIMAL(15,2),
    "avgLoss" DECIMAL(15,2),
    "winRate" DECIMAL(5,2),
    "profitFactor" DECIMAL(5,2),
    "sharpeRatio" DECIMAL(5,2),
    "lastCalculated" TIMESTAMP(3),
    
    -- Timestamps
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "strategies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_accountId_fkey" 
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "strategies_accountId_idx" ON "strategies"("accountId");
CREATE INDEX "strategies_status_idx" ON "strategies"("status");
CREATE INDEX "strategies_createdAt_idx" ON "strategies"("createdAt");

-- Add strategyId to trades table (nullable for backward compatibility)
ALTER TABLE "trades" ADD COLUMN "strategyId" TEXT;

-- AddForeignKey for trades
ALTER TABLE "trades" ADD CONSTRAINT "trades_strategyId_fkey" 
    FOREIGN KEY ("strategyId") REFERENCES "strategies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex for strategyId in trades
CREATE INDEX "trades_strategyId_idx" ON "trades"("strategyId");

-- Add comment for documentation
COMMENT ON TABLE "strategies" IS 'Trading strategies that group related trades/positions with shared rules and allocation';
COMMENT ON COLUMN "trades"."strategyId" IS 'Optional link to strategy - null for legacy trades or manual trades outside strategies';
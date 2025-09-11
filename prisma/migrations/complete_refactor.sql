-- Complete TrendDojo Schema Refactor
-- Portfolio > Strategy > Position > Execution

-- Step 1: Rename Account to Portfolio
ALTER TABLE "accounts" RENAME TO "portfolios";
ALTER TABLE "portfolios" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update foreign key constraints for portfolios
ALTER TABLE "risk_settings" DROP CONSTRAINT "risk_settings_accountId_fkey";
ALTER TABLE "risk_settings" RENAME COLUMN "accountId" TO "portfolioId";
ALTER TABLE "risk_settings" ADD CONSTRAINT "risk_settings_portfolioId_fkey" 
  FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 2: Create Position table
CREATE TABLE "positions" (
  "id" TEXT NOT NULL,
  "strategyId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "assetType" TEXT NOT NULL DEFAULT 'stock',
  "direction" TEXT NOT NULL DEFAULT 'long',
  "status" TEXT NOT NULL DEFAULT 'open',
  
  -- Current state
  "currentQuantity" DECIMAL(15,6) NOT NULL DEFAULT 0,
  "avgEntryPrice" DECIMAL(15,6),
  "avgExitPrice" DECIMAL(15,6),
  
  -- Risk Management
  "stopLoss" DECIMAL(15,6),
  "takeProfit" DECIMAL(15,6),
  "trailingStop" DECIMAL(15,6),
  
  -- P&L
  "realizedPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "unrealizedPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "totalFees" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "netPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Metrics
  "maxGainPercent" DECIMAL(5,2),
  "maxLossPercent" DECIMAL(5,2),
  "holdingDays" INTEGER,
  "rMultiple" DECIMAL(5,2),
  
  -- Timestamps
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "lastExecutionAt" TIMESTAMP(3),
  
  CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create Execution table with comprehensive fees
CREATE TABLE "executions" (
  "id" TEXT NOT NULL,
  "positionId" TEXT NOT NULL,
  
  "type" TEXT NOT NULL,
  "quantity" DECIMAL(15,6) NOT NULL,
  "price" DECIMAL(15,6) NOT NULL,
  
  -- Fees breakdown
  "commission" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "exchangeFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "secFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "tafFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "clearingFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "otherFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
  "totalFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
  
  -- Net amounts
  "grossValue" DECIMAL(15,2) NOT NULL,
  "netValue" DECIMAL(15,2) NOT NULL,
  
  -- Broker data
  "brokerName" TEXT,
  "brokerExecId" TEXT,
  "brokerOrderId" TEXT,
  
  -- Timestamps
  "executedAt" TIMESTAMP(3) NOT NULL,
  "settlementDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- Step 4: Rename trades to trade_plans
ALTER TABLE "trades" RENAME TO "trade_plans";

-- Step 5: Update trade_plans columns
ALTER TABLE "trade_plans" 
  RENAME COLUMN "accountId" TO "portfolioId";

ALTER TABLE "trade_plans"
  ADD COLUMN "positionId" TEXT,
  ADD COLUMN "thesis" TEXT,
  ADD COLUMN "setupType" TEXT,
  ADD COLUMN "confidence" INTEGER,
  ADD COLUMN "executionQuality" INTEGER,
  ADD COLUMN "lessons" TEXT,
  ADD COLUMN "mistakes" TEXT,
  ADD COLUMN "executedAt" TIMESTAMP(3),
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

-- Rename some columns for clarity
ALTER TABLE "trade_plans"
  RENAME COLUMN "actualEntry" TO "plannedEntry";
ALTER TABLE "trade_plans"
  RENAME COLUMN "targetPrice" TO "plannedTarget";
ALTER TABLE "trade_plans"
  RENAME COLUMN "riskAmount" TO "plannedRiskAmount";
ALTER TABLE "trade_plans"
  RENAME COLUMN "riskPercent" TO "plannedRiskPercent";

-- Update status values
UPDATE "trade_plans" 
SET "status" = CASE 
  WHEN "status" = 'planning' THEN 'idea'
  WHEN "status" = 'pending' THEN 'pending'
  WHEN "status" = 'active' THEN 'executed'
  WHEN "status" = 'closed' THEN 'executed'
  ELSE "status"
END;

-- Step 6: Create new note tables
CREATE TABLE "trade_plan_notes" (
  "id" TEXT NOT NULL,
  "tradePlanId" TEXT NOT NULL,
  "noteType" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "trade_plan_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "position_notes" (
  "id" TEXT NOT NULL,
  "positionId" TEXT NOT NULL,
  "noteType" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "position_notes_pkey" PRIMARY KEY ("id")
);

-- Step 7: Migrate existing trade_notes
INSERT INTO "trade_plan_notes" ("id", "tradePlanId", "noteType", "content", "createdAt")
SELECT "id", "tradeId", "noteType", "content", "createdAt"
FROM "trade_notes";

DROP TABLE "trade_notes";

-- Step 8: Update trade_checklist_responses
ALTER TABLE "trade_checklist_responses"
  RENAME COLUMN "tradeId" TO "tradePlanId";

-- Step 9: Add all foreign keys
ALTER TABLE "positions" ADD CONSTRAINT "positions_strategyId_fkey" 
  FOREIGN KEY ("strategyId") REFERENCES "strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "executions" ADD CONSTRAINT "executions_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trade_plans" ADD CONSTRAINT "trade_plans_portfolioId_fkey"
  FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trade_plans" ADD CONSTRAINT "trade_plans_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "trade_plan_notes" ADD CONSTRAINT "trade_plan_notes_tradePlanId_fkey"
  FOREIGN KEY ("tradePlanId") REFERENCES "trade_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "position_notes" ADD CONSTRAINT "position_notes_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "trade_checklist_responses" ADD CONSTRAINT "trade_checklist_responses_tradePlanId_fkey"
  FOREIGN KEY ("tradePlanId") REFERENCES "trade_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 10: Create indexes
CREATE INDEX "positions_strategyId_idx" ON "positions"("strategyId");
CREATE INDEX "positions_symbol_idx" ON "positions"("symbol");
CREATE INDEX "positions_status_idx" ON "positions"("status");

CREATE INDEX "executions_positionId_idx" ON "executions"("positionId");
CREATE INDEX "executions_executedAt_idx" ON "executions"("executedAt");

CREATE INDEX "trade_plans_portfolioId_idx" ON "trade_plans"("portfolioId");
CREATE INDEX "trade_plans_symbol_idx" ON "trade_plans"("symbol");
CREATE INDEX "trade_plans_status_idx" ON "trade_plans"("status");

-- Step 11: Update Strategy performance columns
ALTER TABLE "strategies"
  ADD COLUMN "totalPositions" INTEGER DEFAULT 0,
  ADD COLUMN "openPositions" INTEGER DEFAULT 0,
  ADD COLUMN "closedPositions" INTEGER DEFAULT 0,
  ADD COLUMN "winningPositions" INTEGER DEFAULT 0,
  ADD COLUMN "losingPositions" INTEGER DEFAULT 0,
  ADD COLUMN "totalFees" DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN "netPnl" DECIMAL(15,2) DEFAULT 0;

-- Rename for clarity
ALTER TABLE "strategies"
  RENAME COLUMN "allocationAmount" TO "allocatedCapital";
ALTER TABLE "strategies"
  RENAME COLUMN "allocationPercent" TO "maxRiskPercent";
ALTER TABLE "strategies"
  DROP COLUMN "totalTrades",
  DROP COLUMN "winningTrades", 
  DROP COLUMN "losingTrades";

-- Comments for documentation
COMMENT ON TABLE "portfolios" IS 'User trading portfolios (formerly accounts)';
COMMENT ON TABLE "positions" IS 'Aggregate holdings in a symbol within a strategy';
COMMENT ON TABLE "executions" IS 'Individual fills/transactions with detailed fee tracking';
COMMENT ON TABLE "trade_plans" IS 'Trading journal and planning (formerly trades)';
COMMENT ON COLUMN "executions"."totalFees" IS 'Sum of all fee components for this execution';
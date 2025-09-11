/*
  Warnings:

  - You are about to drop the column `accountId` on the `risk_settings` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `allocationAmount` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `allocationPercent` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `losingTrades` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `maxRiskPerPosition` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `totalPnlPercent` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `totalTrades` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `winningTrades` on the `strategies` table. All the data in the column will be lost.
  - You are about to drop the column `tradeId` on the `trade_checklist_responses` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trade_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trades` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `portfolioId` to the `risk_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolioId` to the `strategies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tradePlanId` to the `trade_checklist_responses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."risk_settings" DROP CONSTRAINT "risk_settings_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."strategies" DROP CONSTRAINT "strategies_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trade_checklist_responses" DROP CONSTRAINT "trade_checklist_responses_tradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trade_notes" DROP CONSTRAINT "trade_notes_tradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trades" DROP CONSTRAINT "trades_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trades" DROP CONSTRAINT "trades_parentTradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trades" DROP CONSTRAINT "trades_strategyId_fkey";

-- DropIndex
DROP INDEX "public"."strategies_accountId_idx";

-- DropIndex
DROP INDEX "public"."strategies_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."risk_settings" DROP COLUMN "accountId",
ADD COLUMN     "portfolioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."strategies" DROP COLUMN "accountId",
DROP COLUMN "allocationAmount",
DROP COLUMN "allocationPercent",
DROP COLUMN "losingTrades",
DROP COLUMN "maxRiskPerPosition",
DROP COLUMN "totalPnlPercent",
DROP COLUMN "totalTrades",
DROP COLUMN "winningTrades",
ADD COLUMN     "allocatedCapital" DECIMAL(15,2),
ADD COLUMN     "closedPositions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "losingPositions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxRiskPercent" DECIMAL(5,2) DEFAULT 2.0,
ADD COLUMN     "netPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "openPositions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "portfolioId" TEXT NOT NULL,
ADD COLUMN     "totalFees" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalPositions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winningPositions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."trade_checklist_responses" DROP COLUMN "tradeId",
ADD COLUMN     "tradePlanId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."accounts";

-- DropTable
DROP TABLE "public"."trade_notes";

-- DropTable
DROP TABLE "public"."trades";

-- CreateTable
CREATE TABLE "public"."portfolios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "broker" TEXT,
    "accountType" TEXT,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "startingBalance" DECIMAL(15,2),
    "currentBalance" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."positions" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" TEXT NOT NULL DEFAULT 'stock',
    "direction" TEXT NOT NULL DEFAULT 'long',
    "status" TEXT NOT NULL DEFAULT 'open',
    "currentQuantity" DECIMAL(15,6) NOT NULL DEFAULT 0,
    "avgEntryPrice" DECIMAL(15,6),
    "avgExitPrice" DECIMAL(15,6),
    "stopLoss" DECIMAL(15,6),
    "takeProfit" DECIMAL(15,6),
    "trailingStop" DECIMAL(15,6),
    "realizedPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "unrealizedPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalFees" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "netPnl" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "maxGainPercent" DECIMAL(5,2),
    "maxLossPercent" DECIMAL(5,2),
    "holdingDays" INTEGER,
    "rMultiple" DECIMAL(5,2),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "lastExecutionAt" TIMESTAMP(3),

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."executions" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(15,6) NOT NULL,
    "price" DECIMAL(15,6) NOT NULL,
    "commission" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "exchangeFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "secFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "tafFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "clearingFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "otherFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "totalFees" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "grossValue" DECIMAL(15,2) NOT NULL,
    "netValue" DECIMAL(15,2) NOT NULL,
    "brokerName" TEXT,
    "brokerExecId" TEXT,
    "brokerOrderId" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "settlementDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_plans" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "positionId" TEXT,
    "symbol" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "timeframe" TEXT,
    "thesis" TEXT NOT NULL,
    "setupType" TEXT,
    "plannedEntry" DECIMAL(15,6) NOT NULL,
    "plannedStop" DECIMAL(15,6) NOT NULL,
    "plannedTarget" DECIMAL(15,6),
    "plannedTarget2" DECIMAL(15,6),
    "plannedTarget3" DECIMAL(15,6),
    "plannedQuantity" DECIMAL(15,6),
    "plannedRiskAmount" DECIMAL(15,2),
    "plannedRiskPercent" DECIMAL(5,2),
    "riskRewardRatio" DECIMAL(5,2),
    "setupQuality" INTEGER,
    "confidence" INTEGER,
    "marketCondition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "outcome" TEXT,
    "executionQuality" INTEGER,
    "lessons" TEXT,
    "mistakes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "trade_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_plan_notes" (
    "id" TEXT NOT NULL,
    "tradePlanId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_plan_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."position_notes" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "positions_strategyId_idx" ON "public"."positions"("strategyId");

-- CreateIndex
CREATE INDEX "positions_symbol_idx" ON "public"."positions"("symbol");

-- CreateIndex
CREATE INDEX "positions_status_idx" ON "public"."positions"("status");

-- CreateIndex
CREATE INDEX "executions_positionId_idx" ON "public"."executions"("positionId");

-- CreateIndex
CREATE INDEX "executions_executedAt_idx" ON "public"."executions"("executedAt");

-- CreateIndex
CREATE INDEX "trade_plans_portfolioId_idx" ON "public"."trade_plans"("portfolioId");

-- CreateIndex
CREATE INDEX "trade_plans_symbol_idx" ON "public"."trade_plans"("symbol");

-- CreateIndex
CREATE INDEX "trade_plans_status_idx" ON "public"."trade_plans"("status");

-- CreateIndex
CREATE INDEX "strategies_portfolioId_idx" ON "public"."strategies"("portfolioId");

-- AddForeignKey
ALTER TABLE "public"."portfolios" ADD CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."strategies" ADD CONSTRAINT "strategies_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."positions" ADD CONSTRAINT "positions_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "public"."strategies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."executions" ADD CONSTRAINT "executions_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_plans" ADD CONSTRAINT "trade_plans_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_plans" ADD CONSTRAINT "trade_plans_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_plan_notes" ADD CONSTRAINT "trade_plan_notes_tradePlanId_fkey" FOREIGN KEY ("tradePlanId") REFERENCES "public"."trade_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."position_notes" ADD CONSTRAINT "position_notes_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_settings" ADD CONSTRAINT "risk_settings_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_checklist_responses" ADD CONSTRAINT "trade_checklist_responses_tradePlanId_fkey" FOREIGN KEY ("tradePlanId") REFERENCES "public"."trade_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

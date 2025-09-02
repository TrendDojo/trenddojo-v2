-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'active',
    "airwallexCustomerId" TEXT,
    "airwallexPaymentMethodId" TEXT,
    "subscriptionExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "broker" TEXT,
    "accountType" TEXT,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "startingBalance" DECIMAL(15,2),
    "currentBalance" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_limits" (
    "tier" TEXT NOT NULL,
    "maxAccounts" INTEGER NOT NULL,
    "maxPositions" INTEGER NOT NULL,
    "maxScreenerResults" INTEGER NOT NULL,
    "screenerRefreshSeconds" INTEGER NOT NULL,
    "hasFundamentals" BOOLEAN NOT NULL,
    "hasRealtimeData" BOOLEAN NOT NULL,
    "hasApiAccess" BOOLEAN NOT NULL,
    "hasBrokerIntegration" BOOLEAN NOT NULL,
    "monthlyPrice" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "subscription_limits_pkey" PRIMARY KEY ("tier")
);

-- CreateTable
CREATE TABLE "public"."risk_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "maxRiskPerTrade" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "maxDailyRisk" DECIMAL(5,2) NOT NULL DEFAULT 3.0,
    "maxWeeklyRisk" DECIMAL(5,2) NOT NULL DEFAULT 6.0,
    "maxOpenPositions" INTEGER NOT NULL DEFAULT 5,
    "maxCorrelatedPositions" INTEGER NOT NULL DEFAULT 3,
    "positionSizingMethod" TEXT NOT NULL DEFAULT 'fixed_risk',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."broker_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "isPaper" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trades" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" TEXT,
    "direction" TEXT,
    "positionGroupId" TEXT,
    "parentTradeId" TEXT,
    "timeframe" TEXT,
    "positionLabel" TEXT,
    "plannedEntry" DECIMAL(15,6),
    "actualEntry" DECIMAL(15,6),
    "entryDate" TIMESTAMP(3),
    "quantity" DECIMAL(15,6),
    "positionSizeUsd" DECIMAL(15,2),
    "stopLoss" DECIMAL(15,6) NOT NULL,
    "initialStop" DECIMAL(15,6),
    "targetPrice" DECIMAL(15,6),
    "targetPrice2" DECIMAL(15,6),
    "riskAmount" DECIMAL(15,2),
    "riskPercent" DECIMAL(5,2),
    "riskRewardRatio" DECIMAL(5,2),
    "maintainRiskOnStopAdjust" BOOLEAN NOT NULL DEFAULT true,
    "originalQuantity" DECIMAL(15,6),
    "stopAdjustmentHistory" JSONB,
    "broker" TEXT,
    "brokerOrderId" TEXT,
    "brokerSyncStatus" TEXT,
    "brokerFillPrice" DECIMAL(15,6),
    "brokerCommission" DECIMAL(10,2),
    "exitPrice" DECIMAL(15,6),
    "exitDate" TIMESTAMP(3),
    "exitReason" TEXT,
    "pnlAmount" DECIMAL(15,2),
    "pnlPercent" DECIMAL(10,2),
    "rMultiple" DECIMAL(5,2),
    "status" TEXT,
    "strategyType" TEXT,
    "setupQuality" INTEGER,
    "marketCondition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_notes" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_checklist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trade_checklist_responses" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "checklistItemId" TEXT NOT NULL,
    "response" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_checklist_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."market_data_cache" (
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "open" DECIMAL(15,6) NOT NULL,
    "high" DECIMAL(15,6) NOT NULL,
    "low" DECIMAL(15,6) NOT NULL,
    "close" DECIMAL(15,6) NOT NULL,
    "volume" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_data_cache_pkey" PRIMARY KEY ("symbol","timeframe","timestamp")
);

-- CreateTable
CREATE TABLE "public"."stock_fundamentals" (
    "symbol" TEXT NOT NULL,
    "marketCap" BIGINT,
    "peRatio" DECIMAL(10,2),
    "pegRatio" DECIMAL(10,2),
    "pbRatio" DECIMAL(10,2),
    "psRatio" DECIMAL(10,2),
    "dividendYield" DECIMAL(5,2),
    "eps" DECIMAL(10,2),
    "revenue" BIGINT,
    "grossMargin" DECIMAL(5,2),
    "operatingMargin" DECIMAL(5,2),
    "profitMargin" DECIMAL(5,2),
    "roe" DECIMAL(5,2),
    "roa" DECIMAL(5,2),
    "debtToEquity" DECIMAL(10,2),
    "currentRatio" DECIMAL(5,2),
    "quickRatio" DECIMAL(5,2),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_fundamentals_pkey" PRIMARY KEY ("symbol")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "market_data_cache_symbol_timestamp_idx" ON "public"."market_data_cache"("symbol", "timestamp");

-- CreateIndex
CREATE INDEX "market_data_cache_timeframe_timestamp_idx" ON "public"."market_data_cache"("timeframe", "timestamp");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_settings" ADD CONSTRAINT "risk_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."risk_settings" ADD CONSTRAINT "risk_settings_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."broker_connections" ADD CONSTRAINT "broker_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_parentTradeId_fkey" FOREIGN KEY ("parentTradeId") REFERENCES "public"."trades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_notes" ADD CONSTRAINT "trade_notes_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "public"."trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_checklist_items" ADD CONSTRAINT "trade_checklist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_checklist_responses" ADD CONSTRAINT "trade_checklist_responses_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "public"."trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."trade_checklist_responses" ADD CONSTRAINT "trade_checklist_responses_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "public"."trade_checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

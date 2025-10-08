-- AlterTable
ALTER TABLE "public"."positions" ADD COLUMN     "broker" TEXT,
ADD COLUMN     "brokerPositionId" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "public"."daily_prices" (
    "symbol" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "open" DECIMAL(15,6) NOT NULL,
    "high" DECIMAL(15,6) NOT NULL,
    "low" DECIMAL(15,6) NOT NULL,
    "close" DECIMAL(15,6) NOT NULL,
    "volume" BIGINT NOT NULL,
    "adjusted_close" DECIMAL(15,6) NOT NULL,
    "data_source" TEXT NOT NULL DEFAULT 'polygon',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_prices_pkey" PRIMARY KEY ("symbol","date")
);

-- CreateTable
CREATE TABLE "public"."stock_metadata" (
    "symbol" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "exchange" TEXT,
    "sector" TEXT,
    "industry" TEXT,
    "market_cap" BIGINT,
    "description" TEXT,
    "website" TEXT,
    "ceo" TEXT,
    "employees" INTEGER,
    "country" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "listing_date" TEXT,
    "ipo_date" TEXT,
    "delist_date" TEXT,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_metadata_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "public"."broker_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "brokerOrderId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" DECIMAL(15,6) NOT NULL,
    "orderType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "limitPrice" DECIMAL(15,6),
    "stopPrice" DECIMAL(15,6),
    "filledQty" DECIMAL(15,6),
    "filledAvgPrice" DECIMAL(15,6),
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "filledAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,

    CONSTRAINT "broker_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broker" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" DECIMAL(15,6) NOT NULL,
    "orderType" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestPayload" JSONB NOT NULL,
    "brokerResponse" JSONB,
    "brokerOrderId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,

    CONSTRAINT "order_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_prices_symbol_idx" ON "public"."daily_prices"("symbol");

-- CreateIndex
CREATE INDEX "daily_prices_date_idx" ON "public"."daily_prices"("date");

-- CreateIndex
CREATE INDEX "daily_prices_symbol_date_idx" ON "public"."daily_prices"("symbol", "date");

-- CreateIndex
CREATE INDEX "stock_metadata_exchange_idx" ON "public"."stock_metadata"("exchange");

-- CreateIndex
CREATE INDEX "stock_metadata_sector_idx" ON "public"."stock_metadata"("sector");

-- CreateIndex
CREATE INDEX "stock_metadata_industry_idx" ON "public"."stock_metadata"("industry");

-- CreateIndex
CREATE INDEX "stock_metadata_is_active_idx" ON "public"."stock_metadata"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "broker_orders_brokerOrderId_key" ON "public"."broker_orders"("brokerOrderId");

-- CreateIndex
CREATE INDEX "broker_orders_userId_status_idx" ON "public"."broker_orders"("userId", "status");

-- CreateIndex
CREATE INDEX "broker_orders_brokerOrderId_idx" ON "public"."broker_orders"("brokerOrderId");

-- CreateIndex
CREATE INDEX "broker_orders_status_idx" ON "public"."broker_orders"("status");

-- CreateIndex
CREATE INDEX "broker_orders_submittedAt_idx" ON "public"."broker_orders"("submittedAt");

-- CreateIndex
CREATE INDEX "order_submissions_userId_idx" ON "public"."order_submissions"("userId");

-- CreateIndex
CREATE INDEX "order_submissions_submittedAt_idx" ON "public"."order_submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "order_submissions_brokerOrderId_idx" ON "public"."order_submissions"("brokerOrderId");

-- CreateIndex
CREATE INDEX "broker_connections_userId_idx" ON "public"."broker_connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_connections_userId_broker_key" ON "public"."broker_connections"("userId", "broker");

-- CreateIndex
CREATE INDEX "positions_broker_symbol_idx" ON "public"."positions"("broker", "symbol");

-- AddForeignKey
ALTER TABLE "public"."broker_orders" ADD CONSTRAINT "broker_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_submissions" ADD CONSTRAINT "order_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Add circuit breaker tracking to portfolios
ALTER TABLE "portfolios"
ADD COLUMN "account_status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "current_drawdown" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- Add versioning support to strategies
ALTER TABLE "strategies"
ADD COLUMN "parent_strategy_id" TEXT,
ADD COLUMN "blocked_reason" TEXT;

-- Add index for parent strategy lookup
CREATE INDEX "strategies_parent_strategy_id_idx" ON "strategies"("parent_strategy_id");

-- Add flexible risk management to risk_settings
ALTER TABLE "risk_settings"
ADD COLUMN "asset_class_limits" JSONB,
ADD COLUMN "drawdown_actions" JSONB;

-- Add comment documentation
COMMENT ON COLUMN "portfolios"."account_status" IS 'Circuit breaker status: active, warning, recovery, locked';
COMMENT ON COLUMN "portfolios"."current_drawdown" IS 'Current percentage drawdown from peak';
COMMENT ON COLUMN "strategies"."parent_strategy_id" IS 'Links to original strategy when cloned';
COMMENT ON COLUMN "strategies"."blocked_reason" IS 'Explanation when strategy is blocked from opening new positions';
COMMENT ON COLUMN "risk_settings"."asset_class_limits" IS 'JSON containing per-asset-class drawdown limits and rules';
COMMENT ON COLUMN "risk_settings"."drawdown_actions" IS 'JSON defining actions at different drawdown levels';
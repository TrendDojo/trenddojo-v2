#!/bin/bash

# Fix Prisma model names to match snake_case schema

echo "Fixing Prisma model names in src/ files..."

# Map of old names to new names
declare -A model_map=(
    ["prisma.execution"]="prisma.executions"
    ["prisma.position"]="prisma.positions"
    ["prisma.portfolio"]="prisma.portfolios"
    ["prisma.strategy"]="prisma.strategies"
    ["prisma.user"]="prisma.users"
    ["prisma.riskSettings"]="prisma.risk_settings"
    ["prisma.tradePlan"]="prisma.trade_plans"
    ["prisma.tradePlanNote"]="prisma.trade_plan_notes"
    ["prisma.positionNote"]="prisma.position_notes"
    ["prisma.brokerConnection"]="prisma.broker_connections"
    ["prisma.tradeChecklistItem"]="prisma.trade_checklist_items"
    ["prisma.tradeChecklistResponse"]="prisma.trade_checklist_responses"
)

# Apply replacements
for old_name in "${!model_map[@]}"; do
    new_name="${model_map[$old_name]}"
    echo "Replacing '$old_name' with '$new_name'"

    # Use sed to replace in all TypeScript files
    find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' "s/$old_name/$new_name/g" {} +
done

echo "✅ Model names fixed!"
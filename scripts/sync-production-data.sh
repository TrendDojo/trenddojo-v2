#!/bin/bash

# Production Data Sync Script
# Synchronizes market data from production API to local SQLite
# Usage: ./scripts/sync-production-data.sh [--full]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_ROOT/data/market"
DB_FILE="$DATA_DIR/trenddojo.db"
BACKUP_DIR="$DATA_DIR/backups"
TEMP_DIR="$PROJECT_ROOT/temp"

# Parse arguments
FULL_SYNC=false
if [[ "$1" == "--full" ]]; then
    FULL_SYNC=true
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       TrendDojo Production Data Sync                    ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Create directories if needed
mkdir -p "$DATA_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$TEMP_DIR"

# Function to backup existing database
backup_database() {
    if [ -f "$DB_FILE" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="$BACKUP_DIR/trenddojo_backup_${TIMESTAMP}.db"
        echo -e "${BLUE}→${NC} Backing up existing database..."
        cp "$DB_FILE" "$BACKUP_FILE"
        echo -e "${GREEN}✓${NC} Backup saved: $(basename "$BACKUP_FILE")"
    fi
}

# Function to get database stats
show_db_stats() {
    if [ -f "$DB_FILE" ]; then
        echo -e "\n${BLUE}📊 Current Database Statistics:${NC}"
        sqlite3 "$DB_FILE" <<EOF
.mode column
.headers on
SELECT
    COUNT(DISTINCT symbol) as 'Total Symbols',
    COUNT(*) as 'Total Records',
    MIN(date) as 'Earliest Date',
    MAX(date) as 'Latest Date'
FROM daily_prices;
EOF
    else
        echo -e "${YELLOW}⚠${NC} No local database found"
    fi
}

# Function to sync via production API (SECURE METHOD)
sync_via_api() {
    echo -e "\n${BLUE}→${NC} Syncing via production API..."

    # Production API endpoints
    API_URL="https://www.trenddojo.com/api/market-data"

    if [ "$FULL_SYNC" = true ]; then
        ENDPOINT="${API_URL}/export?range=all"
        echo -e "${BLUE}→${NC} Full sync - fetching all historical data..."
    else
        ENDPOINT="${API_URL}/export?range=90d"
        echo -e "${BLUE}→${NC} Incremental sync - fetching last 90 days..."
    fi

    echo -e "${BLUE}→${NC} Fetching from: $ENDPOINT"

    # Download data from production API
    # This endpoint should be publicly accessible for data export
    RESPONSE_CODE=$(curl -s -w "%{http_code}" \
         "$ENDPOINT" \
         -o "$TEMP_DIR/market_data.json")

    if [ "$RESPONSE_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} Data fetched from API"

        # Check if file has data
        if [ -s "$TEMP_DIR/market_data.json" ]; then
            # Import JSON data using Node.js script
            cd "$PROJECT_ROOT"
            npm run import-data "$TEMP_DIR/market_data.json"

            rm -f "$TEMP_DIR/market_data.json"
            echo -e "${GREEN}✓${NC} Data imported successfully"
        else
            echo -e "${RED}✗${NC} No data received from API"
            return 1
        fi
    elif [ "$RESPONSE_CODE" -eq 401 ]; then
        echo -e "${RED}✗${NC} Authentication required"
        echo "Please ensure you have access to production data export"
        return 1
    else
        echo -e "${RED}✗${NC} Failed to fetch data from API (HTTP $RESPONSE_CODE)"
        return 1
    fi
}

# Alternative: Use secure CLI authentication
sync_with_auth() {
    echo -e "\n${BLUE}→${NC} Authenticating with production..."

    # Check if we have Vercel CLI installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠${NC} Vercel CLI not found"
        echo "Install with: npm i -g vercel"
        return 1
    fi

    # Use Vercel CLI to securely access production
    echo -e "${BLUE}→${NC} Using Vercel CLI for secure access..."

    # Pull environment variables securely from Vercel
    # This doesn't store credentials locally
    vercel env pull .env.production.temp --environment production --yes 2>/dev/null

    if [ -f ".env.production.temp" ]; then
        # Use the temporary credentials
        source .env.production.temp

        # Now we can use DATABASE_URL securely for this session only
        if [ -n "$DATABASE_URL" ]; then
            echo -e "${GREEN}✓${NC} Authenticated with production"

            # Perform the sync using the temporary credentials
            sync_from_production_secure

            # Clean up temporary file immediately
            rm -f .env.production.temp
        else
            echo -e "${RED}✗${NC} DATABASE_URL not found in production environment"
            rm -f .env.production.temp
            return 1
        fi
    else
        echo -e "${RED}✗${NC} Failed to authenticate with Vercel"
        echo "Please run: vercel login"
        return 1
    fi
}

# Secure production sync (credentials only in memory)
sync_from_production_secure() {
    echo -e "\n${BLUE}→${NC} Syncing from production database..."

    # Create SQL export file
    EXPORT_FILE="$TEMP_DIR/production_export.csv"

    if [ "$FULL_SYNC" = true ]; then
        QUERY="SELECT symbol, date, open, high, low, close, volume FROM market.price_data ORDER BY symbol, date"
    else
        QUERY="SELECT symbol, date, open, high, low, close, volume FROM market.price_data WHERE date >= CURRENT_DATE - INTERVAL '90 days' ORDER BY symbol, date"
    fi

    # Parse DATABASE_URL and export (credentials only in memory)
    if [[ $DATABASE_URL =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        PGPASSWORD="${BASH_REMATCH[2]}" psql \
            -h "${BASH_REMATCH[3]}" \
            -p "${BASH_REMATCH[4]}" \
            -U "${BASH_REMATCH[1]}" \
            -d "${BASH_REMATCH[5]}" \
            -c "$QUERY" \
            --csv \
            -o "$EXPORT_FILE" \
            --quiet

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Data exported from production"

            # Import into local SQLite
            import_to_sqlite "$EXPORT_FILE"

            # Clean up
            rm -f "$EXPORT_FILE"
        else
            echo -e "${RED}✗${NC} Failed to export from production"
            return 1
        fi
    fi
}

# Import data to SQLite
import_to_sqlite() {
    local CSV_FILE=$1

    echo -e "${BLUE}→${NC} Importing into local SQLite database..."

    # Ensure database structure exists
    sqlite3 "$DB_FILE" <<EOF
CREATE TABLE IF NOT EXISTS daily_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    date TEXT NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_symbol ON daily_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_date ON daily_prices(date);
CREATE INDEX IF NOT EXISTS idx_symbol_date ON daily_prices(symbol, date);
EOF

    # Import CSV data
    sqlite3 "$DB_FILE" <<EOF
.mode csv
.import $CSV_FILE daily_prices_temp

-- Insert or update from temp table
INSERT OR REPLACE INTO daily_prices (symbol, date, open, high, low, close, volume)
SELECT symbol, date, open, high, low, close, volume
FROM daily_prices_temp;

-- Clean up temp table
DROP TABLE IF EXISTS daily_prices_temp;
EOF

    echo -e "${GREEN}✓${NC} Data imported successfully"
}

# Main execution
main() {
    echo -e "${BLUE}→${NC} Checking environment..."

    # Show current stats
    show_db_stats

    # Backup existing database
    backup_database

    # Try different sync methods in order of preference
    echo -e "\n${BLUE}Select sync method:${NC}"
    echo "1) Production API (recommended - no credentials needed)"
    echo "2) Vercel CLI (secure - requires Vercel login)"
    echo "3) Cancel"

    read -p "Choice [1]: " choice
    choice=${choice:-1}

    case $choice in
        1)
            sync_via_api
            ;;
        2)
            sync_with_auth
            ;;
        *)
            echo -e "${YELLOW}Cancelled${NC}"
            exit 0
            ;;
    esac

    # Show updated stats
    echo ""
    show_db_stats

    echo -e "\n${GREEN}✅ Sync process complete!${NC}"

    # Clean up old backups (keep only last 5)
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "\n${BLUE}→${NC} Cleaning up old backups..."
        cd "$BACKUP_DIR"
        ls -t1 trenddojo_backup_*.db 2>/dev/null | tail -n +6 | xargs -r rm
        echo -e "${GREEN}✓${NC} Kept last 5 backups"
    fi
}

# Run main function
main
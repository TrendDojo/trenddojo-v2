#!/bin/bash

# TrendDojo Database Operations Script
# Provides safe database operations for development and deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

confirm_action() {
    local message="$1"
    echo -e "${YELLOW}${message}${NC}"
    read -p "Type 'YES' to continue: " confirmation
    if [ "$confirmation" != "YES" ]; then
        log_info "Operation cancelled"
        exit 0
    fi
}

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
COMMAND="$1"
ENVIRONMENT="${2:-local}"

case "$COMMAND" in
    "validate")
        log_info "Validating Prisma schema..."
        npx prisma validate
        log_success "Schema validation passed"
        ;;
        
    "migrate-status")
        log_info "Checking migration status for $ENVIRONMENT environment..."
        case "$ENVIRONMENT" in
            "local")
                npx prisma migrate status
                ;;
            "staging")
                if [ -z "$STAGING_DATABASE_URL" ]; then
                    log_error "STAGING_DATABASE_URL environment variable not set"
                    exit 1
                fi
                DATABASE_URL="$STAGING_DATABASE_URL" npx prisma migrate status
                ;;
            "production")
                log_error "Production migration status check requires manual verification"
                log_info "Please check via Supabase dashboard or contact administrator"
                exit 1
                ;;
        esac
        ;;
        
    "migrate-dev")
        if [ "$ENVIRONMENT" != "local" ]; then
            log_error "Development migrations can only be run locally"
            exit 1
        fi
        
        log_info "Creating development migration..."
        read -p "Enter migration name: " migration_name
        if [ -z "$migration_name" ]; then
            log_error "Migration name cannot be empty"
            exit 1
        fi
        
        npx prisma migrate dev --name "$migration_name"
        log_success "Development migration created successfully"
        ;;
        
    "migrate-deploy")
        case "$ENVIRONMENT" in
            "local")
                log_info "Deploying migrations to local database..."
                npx prisma migrate deploy
                ;;
            "staging")
                confirm_action "⚠️  Deploy migrations to STAGING environment?"
                if [ -z "$STAGING_DATABASE_URL" ]; then
                    log_error "STAGING_DATABASE_URL environment variable not set"
                    exit 1
                fi
                DATABASE_URL="$STAGING_DATABASE_URL" npx prisma migrate deploy
                ;;
            "production")
                log_error "Production migrations must be deployed via CI/CD pipeline"
                log_info "Push changes to main branch to trigger staging deployment"
                log_info "Production deployment requires manual approval in GitHub Actions"
                exit 1
                ;;
        esac
        log_success "Migration deployment completed"
        ;;
        
    "reset")
        if [ "$ENVIRONMENT" != "local" ]; then
            log_error "Database reset can only be performed locally"
            exit 1
        fi
        
        confirm_action "⚠️  This will DESTROY all data in your local database. Continue?"
        log_info "Resetting local database..."
        npx prisma migrate reset --force
        log_success "Database reset completed"
        ;;
        
    "generate")
        log_info "Generating Prisma client..."
        npx prisma generate
        log_success "Prisma client generated successfully"
        ;;
        
    "studio")
        if [ "$ENVIRONMENT" != "local" ]; then
            log_error "Prisma Studio can only be run against local database"
            exit 1
        fi
        
        log_info "Opening Prisma Studio..."
        npx prisma studio
        ;;
        
    "connection-test")
        log_info "Testing database connection for $ENVIRONMENT environment..."
        case "$ENVIRONMENT" in
            "local")
                npx prisma db execute --stdin <<< "SELECT 1 as test;" > /dev/null
                ;;
            "staging")
                if [ -z "$STAGING_DATABASE_URL" ]; then
                    log_error "STAGING_DATABASE_URL environment variable not set"
                    exit 1
                fi
                DATABASE_URL="$STAGING_DATABASE_URL" npx prisma db execute --stdin <<< "SELECT 1 as test;" > /dev/null
                ;;
            "production")
                log_error "Production connection testing requires administrator access"
                exit 1
                ;;
        esac
        log_success "Database connection successful"
        ;;
        
    "help"|*)
        echo "TrendDojo Database Operations Script"
        echo ""
        echo "Usage: $0 <command> [environment]"
        echo ""
        echo "Commands:"
        echo "  validate                 - Validate Prisma schema"
        echo "  migrate-status [env]     - Check migration status (local/staging)"
        echo "  migrate-dev              - Create new development migration (local only)"
        echo "  migrate-deploy [env]     - Deploy migrations (local/staging)"
        echo "  reset                    - Reset database (local only)"
        echo "  generate                 - Generate Prisma client"
        echo "  studio                   - Open Prisma Studio (local only)"
        echo "  connection-test [env]    - Test database connection"
        echo "  help                     - Show this help message"
        echo ""
        echo "Environments:"
        echo "  local      - Local development database (default)"
        echo "  staging    - Staging database (requires STAGING_DATABASE_URL)"
        echo "  production - Production database (CI/CD only)"
        echo ""
        echo "Examples:"
        echo "  $0 validate"
        echo "  $0 migrate-status staging"
        echo "  $0 migrate-dev"
        echo "  $0 connection-test staging"
        ;;
esac
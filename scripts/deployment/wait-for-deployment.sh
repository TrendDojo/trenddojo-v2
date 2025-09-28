#!/bin/bash

# Wait for Vercel deployment to complete
# Monitors deployment status and runs verification when ready

set -e

echo "⏳ WAITING FOR VERCEL DEPLOYMENT"
echo "================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MAX_WAIT_TIME=600  # 10 minutes
CHECK_INTERVAL=10   # Check every 10 seconds
ELAPSED=0

# Function to get latest deployment status
get_deployment_status() {
    # Try to get deployment status from Vercel CLI
    if command -v vercel &> /dev/null; then
        status=$(vercel ls --json 2>/dev/null | jq -r '.[0].state' 2>/dev/null || echo "")
        url=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")

        if [ -n "$status" ]; then
            echo "$status|$url"
            return
        fi
    fi

    # Fallback: check GitHub API for deployment status
    if [ -n "$GITHUB_TOKEN" ]; then
        deployment=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/TrendDojo/trenddojo-v2/deployments?limit=1" \
            2>/dev/null | jq -r '.[0].statuses_url' 2>/dev/null)

        if [ -n "$deployment" ] && [ "$deployment" != "null" ]; then
            status=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "$deployment" \
                2>/dev/null | jq -r '.[0].state' 2>/dev/null || echo "")
            echo "$status|"
            return
        fi
    fi

    echo "|"
}

# Function to check if URL is accessible
check_url_ready() {
    local url=$1
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    [ "$response" = "200" ]
}

echo -e "${BLUE}Monitoring Vercel deployment...${NC}"
echo -e "Maximum wait time: ${YELLOW}${MAX_WAIT_TIME}s${NC}"
echo ""

# Main monitoring loop
while [ $ELAPSED -lt $MAX_WAIT_TIME ]; do
    # Get deployment status
    IFS='|' read -r status url <<< "$(get_deployment_status)"

    # Display status
    if [ -n "$status" ]; then
        echo -ne "\r${YELLOW}Status:${NC} $status | ${YELLOW}Time:${NC} ${ELAPSED}s"

        # Check different status values
        case "$status" in
            "READY"|"ready"|"success")
                echo -e "\n\n${GREEN}✅ Deployment READY!${NC}"
                if [ -n "$url" ]; then
                    # Ensure https://
                    if [[ ! "$url" =~ ^https?:// ]]; then
                        url="https://$url"
                    fi
                    echo -e "URL: ${BLUE}$url${NC}"

                    # Wait a bit for the deployment to fully propagate
                    echo -e "\n${YELLOW}Waiting 10s for deployment to propagate...${NC}"
                    sleep 10

                    # Run verification
                    echo -e "\n${YELLOW}Running automated verification...${NC}"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    if ./scripts/deployment/verify-preview.sh "$url"; then
                        echo -e "\n${GREEN}🎉 DEPLOYMENT VERIFIED SUCCESSFULLY!${NC}"
                        echo -e "Ready for production: ${BLUE}npm run deploy:production${NC}"
                        exit 0
                    else
                        echo -e "\n${RED}⚠️ Verification failed but deployment is ready${NC}"
                        echo -e "Preview URL: ${BLUE}$url${NC}"
                        exit 1
                    fi
                else
                    echo -e "\n${YELLOW}⚠️ Deployment ready but URL not found${NC}"
                    echo "Please run verification manually:"
                    echo -e "${BLUE}./scripts/deployment/verify-preview.sh <preview-url>${NC}"
                    exit 0
                fi
                ;;

            "BUILDING"|"building"|"pending"|"in_progress")
                # Still building, continue waiting
                ;;

            "ERROR"|"error"|"failed"|"failure")
                echo -e "\n\n${RED}❌ Deployment FAILED!${NC}"
                echo "Check Vercel dashboard for error details:"
                echo "https://vercel.com/dashboard"
                exit 1
                ;;

            "CANCELED"|"canceled"|"cancelled")
                echo -e "\n\n${YELLOW}⚠️ Deployment was canceled${NC}"
                exit 1
                ;;

            *)
                # Unknown status, try URL if available
                if [ -n "$url" ]; then
                    if [[ ! "$url" =~ ^https?:// ]]; then
                        url="https://$url"
                    fi
                    if check_url_ready "$url"; then
                        echo -e "\n\n${GREEN}✅ Deployment accessible!${NC}"
                        echo -e "URL: ${BLUE}$url${NC}"
                        echo -e "\n${YELLOW}Running verification...${NC}"
                        ./scripts/deployment/verify-preview.sh "$url"
                        exit $?
                    fi
                fi
                ;;
        esac
    else
        echo -ne "\r${YELLOW}Waiting for deployment status...${NC} (${ELAPSED}s)"
    fi

    # Sleep and increment
    sleep $CHECK_INTERVAL
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))
done

# Timeout reached
echo -e "\n\n${RED}⏰ Timeout reached after ${MAX_WAIT_TIME}s${NC}"
echo "Deployment may still be in progress. Check manually:"
echo -e "${BLUE}vercel ls${NC}"
echo "Or visit: https://vercel.com/dashboard"

# Try one more time to get URL
IFS='|' read -r status url <<< "$(get_deployment_status)"
if [ -n "$url" ]; then
    if [[ ! "$url" =~ ^https?:// ]]; then
        url="https://$url"
    fi
    echo -e "\nLast known URL: ${BLUE}$url${NC}"
    echo -e "You can run verification manually:"
    echo -e "${BLUE}./scripts/verify-preview.sh $url${NC}"
fi

exit 1
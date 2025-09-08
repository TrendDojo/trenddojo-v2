# Vercel Secrets Debugging Guide

## Current Issue
GitHub Actions deployment failing with: `Error: Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})`

## Required GitHub Secrets
The following secrets need to be configured in GitHub repository settings:

### 1. VERCEL_TOKEN
- **Location**: Vercel Dashboard → Settings → Tokens
- **Create**: Generate new token with appropriate permissions
- **Format**: `vercel_...` (long alphanumeric string)

### 2. PROJECT_ID 
- **Location**: Vercel Project Settings → General
- **Find**: Project ID section (usually starts with `prj_`)
- **Format**: `prj_xxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. ORG_ID (Team ID)
- **Location**: Vercel Team Settings → General  
- **Find**: Team ID section
- **Format**: `team_xxxxxxxxxxxxxxxxxxxxxxxxx` (NOT the team name like "traderclicks")

### 4. TEAM_ID
- **Should be**: Same value as ORG_ID
- **Format**: `team_xxxxxxxxxxxxxxxxxxxxxxxxx`

## How to Get Correct Values

### Step 1: Get PROJECT_ID
1. Go to Vercel Dashboard
2. Click on your "trenddojo-v2" project
3. Go to Settings → General
4. Copy the Project ID (starts with `prj_`)

### Step 2: Get ORG_ID/TEAM_ID
1. Go to Vercel Dashboard
2. Click on your team/organization settings (usually in top-left dropdown)
3. Go to General settings
4. Copy the Team ID (starts with `team_`)
5. Use this SAME value for both ORG_ID and TEAM_ID secrets

### Step 3: Verify VERCEL_TOKEN
1. Go to Vercel Dashboard → Account Settings → Tokens
2. Verify your token has the right permissions
3. Consider regenerating if unsure

## Expected Workflow
```yaml
# In GitHub Actions, these should resolve to:
vercel-org-id: ${{ secrets.ORG_ID }}        # team_xxxxx
vercel-project-id: ${{ secrets.PROJECT_ID }} # prj_xxxxx  
scope: ${{ secrets.TEAM_ID }}                # team_xxxxx (same as ORG_ID)
vercel-token: ${{ secrets.VERCEL_TOKEN }}    # vercel_xxxxx
```

## Testing the Fix
After updating secrets in GitHub:
1. Go to Actions tab
2. Re-run the most recent failed workflow
3. Or make a small commit to trigger new deployment

## Token Update Log
- 2025-09-08: Updated VERCEL_TOKEN - testing deployment

## Common Issues
- **Team Name vs Team ID**: Using "traderclicks" instead of "team_xxxxx"
- **Project Name vs Project ID**: Using "trenddojo-v2" instead of "prj_xxxxx"  
- **Wrong Token Permissions**: Token doesn't have access to team/project
- **Stale Secrets**: Old values cached in GitHub
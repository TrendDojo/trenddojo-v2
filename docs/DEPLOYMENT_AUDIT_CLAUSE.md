# Deployment Documentation Audit Standards

## 🔍 Quick Reality Check (Run Monthly)
```bash
# 1. Verify port assignment matches reality
starto --list | grep trenddojo-v2  # Should match PORT_CONFIG.md

# 2. Test all documented scripts exist and run
for script in $(grep -h "\.sh" docs/DEPLOYMENT_GUIDE.md | grep -o '[^"]*\.sh' | sort -u); do
  [[ -f "$script" ]] && echo "✅ $script" || echo "❌ $script MISSING"
done

# 3. Verify environment variables match code
grep -r "process.env\." src/ --include="*.ts" --include="*.tsx" | \
  grep -o "process\.env\.[A-Z_]*" | sort -u | \
  while read var; do
    grep -q "${var#process.env.}" docs/ENVIRONMENT_VARIABLES.md || echo "⚠️ Undocumented: $var"
  done

# 4. Check health endpoint returns expected format
curl -s localhost:$(starto --list | grep trenddojo-v2 | awk '{print $3}' | cut -d: -f2)/api/health | jq .status
```

## 📏 Documentation Standards

### MUST Have
- **Accuracy**: Every command must work when copy-pasted
- **Currency**: Updated within 24h of any deployment process change
- **Single Truth**: One topic, one file, no duplicates
- **Testability**: All procedures include verification steps

### MUST NOT Have
- **Hardcoded Secrets**: Use placeholders like `[YOUR_API_KEY]`
- **Absolute Ports**: Reference PORT_CONFIG.md or starto
- **Stale URLs**: Verify all URLs return 200 monthly
- **Assumed State**: Always document prerequisites

### Efficiency Rules
1. **3-Click Rule**: Any procedure reachable within 3 clicks from DEPLOYMENT_README.md
2. **Copy-Paste Ready**: Commands formatted for direct terminal use
3. **Fail Fast**: Pre-flight checks before long operations
4. **Rollback First**: Every deploy procedure has rollback documented

### Security Requirements
- Preview URLs must use Vercel domains (not custom)
- No production credentials in examples
- Security headers verified in every deployment
- Deprecation notices on insecure practices

### Release Documentation Requirements
- Version numbers assigned AFTER preview testing
- CHANGELOG.md updated with verified changes
- Releases tagged in git
- Follow [Release Standard](../../_shared-framework/standards/RELEASE-DOCUMENTATION-STANDARD.md)

## 🔄 Maintenance Contract
**Weekly**: Update DEPLOYMENT_STATUS.md if deployments occurred
**Monthly**: Run reality check script above
**Quarterly**: Review all deprecated docs for deletion
**On Change**: Update docs in same PR as process changes
**On Release**: Update CHANGELOG.md after preview verification

---
*This clause ensures documentation stays accurate, secure, and useful without becoming bureaucratic.*
# Port Configuration

## 🎯 Central Port Management

**IMPORTANT**: Ports are centrally managed by the `starto` script, which overrides all local configurations.

### Current Port Assignment
```bash
# To see the current port for TrendDojo:
starto --list | grep trenddojo-v2

# As of last check:
# trenddojo-v2 → localhost:3002
```

### Port Resolution Order
1. **starto script** (`/usr/local/bin/starto`) - AUTHORITATIVE
2. Package.json scripts - IGNORED when using starto
3. Environment variables - IGNORED when using starto

### How to Start the Dev Server

#### Option 1: Using starto (RECOMMENDED)
```bash
# From project directory:
starto

# Or from anywhere:
starto ~/coding/trenddojo-v2
```

#### Option 2: Direct npm (if starto unavailable)
```bash
npm run dev
# Note: This uses port 3011 from package.json
```

### Checking Current Port Assignment
```bash
# Method 1: Check starto registry
cat /usr/local/bin/starto | grep "'trenddojo-v2':" | head -1

# Method 2: Use starto list
starto --list | grep trenddojo-v2

# Method 3: Check what's actually running
lsof -i :3002  # Or whatever port starto assigns
```

### Port Conflicts
If you see port conflicts, starto will automatically:
1. Kill any process using the assigned port
2. Start the dev server on the correct port

### Updating Port Assignment
To change the port assignment:
1. Edit `/usr/local/bin/starto`
2. Find the `PROJECT_PORTS` object
3. Update the `'trenddojo-v2'` entry
4. Save and restart

### Why Central Management?
- **Consistency**: All developers use same ports
- **No Conflicts**: Each project has dedicated port
- **Override Local**: Prevents accidental port changes
- **Single Source**: One place to check/update

## 📝 Documentation References

When documenting ports in other files, use this pattern:
```markdown
The development server runs on the port assigned by starto
(check `docs/PORT_CONFIG.md` for current assignment).
```

This ensures documentation remains accurate even if starto changes.

---
*Last verified: 2025-09-28*
*Starto version: Check with `cat /usr/local/bin/starto | head -10`*
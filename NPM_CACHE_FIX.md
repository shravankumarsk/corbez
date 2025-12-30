# npm Cache Permission Fix - Complete Guide

## The Problem

Your npm cache contains files owned by `root` instead of your user. This prevents `npm install` from working.

Error messages you're seeing:
```
npm error code EACCES
npm error syscall mkdir
npm error path /Users/shravankumar/.npm/_cacache/...
npm error errno EACCES (Permission denied)
```

This happened because npm was run with `sudo` at some point in the past.

---

## Solution 1: Fix Permissions (Recommended - 30 seconds)

### Quick Fix
```bash
sudo chown -R $(whoami) ~/.npm
```

Then install dependencies:
```bash
cd ~/Desktop/corbe
npm install --legacy-peer-deps
```

**Why this works**: Changes ownership of all cache files from `root` to your user account.

---

## Solution 2: Complete npm Reset (Safest - 1 minute)

If Solution 1 doesn't work, completely reset npm:

```bash
# Remove npm cache and config
rm -rf ~/.npm
rm -rf ~/.npmrc

# Then install
cd ~/Desktop/corbe
npm install --legacy-peer-deps
```

**Why this works**: Deletes all cached files, forcing npm to download everything fresh.

---

## Solution 3: Use pnpm (Alternative Package Manager - 2 minutes)

If npm continues causing issues, switch to pnpm:

```bash
# Install pnpm globally
sudo npm install -g pnpm

# Install project dependencies
cd ~/Desktop/corbe
pnpm install

# Start development
pnpm dev
```

**Why this works**: pnpm uses a different cache location (`~/.pnpm-store`) which doesn't have permission issues.

---

## Solution 4: Reinstall npm (Nuclear Option - 5 minutes)

If everything else fails, completely reinstall Node.js and npm:

```bash
# Check your Node version
node --version

# Uninstall npm
npm uninstall -g npm

# Reinstall latest npm
npm install -g npm@latest

# Clear cache directory
rm -rf ~/.npm

# Install project dependencies
cd ~/Desktop/corbe
npm install --legacy-peer-deps
```

---

## How to Prevent This in the Future

Never run npm with `sudo`:
```bash
# ❌ BAD - Never do this
sudo npm install

# ✅ GOOD - Do this instead
npm install

# If you get permission errors on global installs, fix npm permissions:
# https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
```

---

## Verification

After fixing, verify npm works:
```bash
# This should work without errors
npm install -g npm@latest

# This should also work
cd ~/Desktop/corbe
npm install --legacy-peer-deps
```

If both succeed, you're good to go!

---

## Running the Project After Fix

Once `npm install` completes:

```bash
cd ~/Desktop/corbe
npm run dev
```

Then open: http://localhost:3000

---

## Still Having Issues?

1. **Check permission**: `ls -la ~/.npm/_cacache/` - should show your user, not `root`
2. **Check disk space**: `df -h` - make sure you have 2GB+ free
3. **Check Node version**: `node --version` - should be v18+
4. **Check npm version**: `npm --version` - should be v10+

---

## Quick Command Reference

```bash
# Fix permissions (fastest)
sudo chown -R $(whoami) ~/.npm

# Complete reset (if permissions fix doesn't work)
rm -rf ~/.npm ~/.npmrc

# Switch to pnpm (alternative)
sudo npm install -g pnpm && cd ~/Desktop/corbe && pnpm install

# Verify fix worked
npm install --legacy-peer-deps

# Start development
npm run dev
```

Pick Solution 1 first. If it doesn't work, try Solution 2. If you're impatient, jump to Solution 3.


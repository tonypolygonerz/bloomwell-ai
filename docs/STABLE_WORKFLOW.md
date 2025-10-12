# Stable Development Workflow for Bloomwell AI

**Purpose:** Prevent site breaking, reduce server restarts, maintain development velocity

---

## Problem Analysis

### Why Sites Keep Breaking

1. **Hot Module Replacement (HMR) Issues**
   - Next.js 15 has aggressive caching
   - Prisma client regeneration doesn't trigger HMR
   - Component state can become stale

2. **Prisma Schema Changes**
   - Every schema change requires `prisma generate`
   - Generated client doesn't reload without server restart
   - Types become out of sync

3. **Race Conditions**
   - Multiple file saves trigger multiple HMR updates
   - Cursor AI can modify multiple files simultaneously
   - Build system can't keep up

---

## The Stable Workflow (Follow Strictly)

### Before Starting Development

```bash
# 1. Verify clean state
git status

# 2. Check for linting errors
npm run lint

# 3. Type check
npm run type-check

# 4. Start server fresh
./scripts/dev-restart.sh
```

**Or use the quick restart command anytime:**
```bash
./scripts/dev-restart.sh
```

---

## During Development: The One-System-At-A-Time Rule

### ✅ CORRECT Approach

**Work on ONE system per session:**
```bash
# Session 1: Fix AI toggle buttons
1. Modify src/app/admin/ai-models/page.tsx
2. Test in browser
3. If working, commit immediately
4. Done for this session

# Session 2: Add grant matching
1. Modify src/app/api/grants/match/route.ts
2. Test with Postman/curl
3. If working, commit immediately
4. Done for this session
```

### ❌ WRONG Approach (Causes Breaks)

**Don't mix multiple systems:**
```bash
# DON'T DO THIS IN ONE SESSION:
1. Fix AI toggle buttons
2. Add webinar calendar
3. Update pricing page
4. Modify Prisma schema
5. Create new API route
6. Update authentication flow

# Result: Something will break, hard to debug which change caused it
```

---

## When to Restart Server

### Always Restart After:
- ✅ Prisma schema changes (`prisma/schema.prisma`)
- ✅ Environment variable changes (`.env.local`)
- ✅ Next.js config changes (`next.config.js`)
- ✅ API route signature changes
- ✅ Installing new npm packages

### Usually Need to Restart After:
- ⚠️ Multiple component changes at once
- ⚠️ Context provider changes
- ⚠️ Middleware modifications
- ⚠️ Hook dependencies changing

### Hot Reload Should Work For:
- ✅ Single component styling changes
- ✅ Text/copy updates
- ✅ Adding console.logs for debugging
- ✅ Simple prop changes

**Rule of Thumb:** If you're not sure, just restart. It takes 30 seconds vs. 30 minutes of debugging mysterious errors.

---

## Prisma Workflow (Critical)

### When Making Schema Changes:

```bash
# 1. Make your changes to prisma/schema.prisma
nano prisma/schema.prisma

# 2. ALWAYS run both commands in this order:
npx prisma generate    # Regenerate client
npx prisma db push     # Update database

# 3. ALWAYS restart server
./scripts/dev-restart.sh

# 4. Verify in Prisma Studio
npx prisma studio
```

### Common Prisma Mistakes:

❌ **WRONG:**
```bash
# Only running db push
npx prisma db push
npm run dev  # Types will be out of sync!
```

✅ **CORRECT:**
```bash
# Both commands + restart
npx prisma generate
npx prisma db push
./scripts/dev-restart.sh
```

---

## Testing Workflow

### Before Committing ANY Code:

```bash
# 1. Check syntax
npm run lint

# 2. Check types
npm run type-check

# 3. Test the actual feature in browser
# - Create new incognito window
# - Test the specific feature you changed
# - Check browser console for errors

# 4. If all passes, commit immediately
git add .
git commit -m "fix: [specific thing you fixed]"
git push origin main
```

### Never Commit Without Testing:
- ❌ Don't commit "blind" changes from AI suggestions
- ❌ Don't assume it works because there are no TypeScript errors
- ❌ Don't commit multiple unrelated changes together

---

## AI Assistant Workflow (Cursor/Claude)

### Effective Prompting Pattern:

**Bad Prompt:**
> "Add a webinar calendar, fix the AI toggles, update the pricing page, and improve the onboarding flow"

**Good Prompt:**
> "I need to fix the AI model toggle buttons in /admin/ai-models. They currently don't show loading state. Please:
> 
> 1. Add a loading state using useOptimisticUpdate hook
> 2. Only modify src/app/admin/ai-models/page.tsx
> 3. Don't change any other files
> 4. Show me the exact changes before applying"

### Verification Pattern:

```bash
# After AI makes changes:
1. Review the diff in VSCode
2. Restart server (./scripts/dev-restart.sh)
3. Test in browser
4. If broken, ask AI: "This broke. What's the error?"
5. If working, commit immediately
```

---

## Emergency Recovery

### If Site Completely Breaks:

```bash
# 1. Don't panic
# 2. Check git status
git status

# 3. If recent changes are causing issues, revert
git diff HEAD~1  # See what changed
git reset --hard HEAD~1  # Go back one commit

# 4. Clean restart
./scripts/dev-restart.sh

# 5. Test if working
# 6. Re-apply changes one at a time
```

### Nuclear Option (Last Resort):

```bash
# This will reset EVERYTHING to last working state
git reset --hard origin/main
rm -rf node_modules .next
npm install
./scripts/dev-restart.sh
```

---

## Daily Development Checklist

### Start of Day:
```bash
☐ Pull latest changes: git pull origin main
☐ Install any new dependencies: npm install
☐ Clean restart: ./scripts/dev-restart.sh
☐ Verify site loads: http://localhost:3000
☐ Check Prisma Studio: npx prisma studio
```

### During Development:
```bash
☐ Work on ONE system at a time
☐ Test after EVERY significant change
☐ Restart server when in doubt
☐ Commit frequently (working code only)
```

### End of Day:
```bash
☐ Final test: Full user flow works
☐ Commit all working changes: git add . && git commit
☐ Push to GitHub: git push origin main
☐ Verify GitHub shows latest commit
☐ Shut down server: killall node
```

---

## Performance Optimization Tips

### Reduce Server Restarts:

1. **Use React DevTools**
   - See what components re-render
   - Debug state issues without server restart

2. **Use Browser DevTools**
   - Check Network tab for API errors
   - Verify API responses without modifying code

3. **Use console.log Strategically**
   - Add temporary logging to debug
   - Remove before committing

4. **Test in Isolation**
   - Create test pages (`/test-feature`)
   - Verify functionality before integrating

### Optimize HMR:

1. **Avoid Barrel Imports**
   ```typescript
   // ❌ Slow HMR
   import { Component1, Component2, Component3 } from '@/components'
   
   // ✅ Fast HMR
   import { Component1 } from '@/components/Component1'
   ```

2. **Use React.memo for Expensive Components**
   ```typescript
   export default React.memo(ExpensiveComponent);
   ```

3. **Avoid Top-Level Side Effects**
   ```typescript
   // ❌ Runs on every HMR
   const data = fetchData();
   
   // ✅ Only runs when needed
   useEffect(() => {
     fetchData();
   }, []);
   ```

---

## Troubleshooting Common Issues

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
./scripts/dev-restart.sh
```

### Issue: "Prisma client is not initialized"

**Solution:**
```bash
npx prisma generate
./scripts/dev-restart.sh
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Issue: "Cannot read property of undefined" in API routes

**Solution:**
1. Check if Prisma client regenerated
2. Check if environment variables loaded
3. Restart server
4. If still broken, check database schema matches code

### Issue: Changes not appearing in browser

**Solution:**
```bash
# Hard refresh in browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# If that doesn't work:
./scripts/dev-restart.sh
```

---

## Summary: The Golden Rules

1. **One system at a time** - Don't mix unrelated changes
2. **Test before committing** - Always verify in browser
3. **Restart when in doubt** - 30 seconds vs 30 minutes debugging
4. **Commit frequently** - Working code should be backed up
5. **Use the restart script** - `./scripts/dev-restart.sh`
6. **Check mission scope** - Does this help grant discovery?
7. **Keep it simple** - 80% of value with 20% of effort

**Remember:** A working simple feature is better than a broken complex one.
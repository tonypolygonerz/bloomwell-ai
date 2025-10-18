# Scripts Directory

Organized utility scripts for Bloomwell AI development, deployment, and maintenance.

## 📁 Directory Structure

```
scripts/
├── database/          # Database operations and seeding
│   ├── seed-admin.js
│   ├── seed-webinars.js
│   ├── import-ca-grants.js
│   ├── sync-grants-now.ts
│   └── ...
├── deployment/        # Production deployment utilities
│   ├── setup-admin-session.js
│   └── setup-ollama-cloud.js
├── maintenance/       # System maintenance and testing
│   ├── test-ollama-cloud.js
│   └── test-web-search-api.js
└── README.md         # This file
```

---

## 🗂️ Categories

### Database Scripts (`database/`)

**Purpose:** Database initialization, seeding, and data management

| Script | Command | Description |
|--------|---------|-------------|
| `seed-admin.js` | `npm run db:seed:admin` | Create full admin user |
| `seed-admin-simple.js` | `npm run db:seed:admin:simple` | Quick admin setup |
| `seed-webinars.js` | `npm run db:seed:webinars` | Seed webinar examples |
| `seed-templates.js` | `npm run db:seed:templates` | Seed email templates |
| `seed-notification-templates.js` | `npm run db:seed:notifications` | Seed notification templates |
| `create-test-user.js` | `npm run db:create:test-user` | Create test user |
| `clear-test-organization.js` | `npm run db:clear:test-org` | Clear test org data |
| `fix-trial-dates.js` | `npm run db:fix:trial-dates` | Fix trial dates |
| `import-ca-grants.js` | `npm run grants:import:ca` | Import CA grants |
| `sync-grants-now.ts` | `npm run grants:sync` | Sync federal grants |
| `check-grants-count.js` | `npm run grants:check` | Check grant counts |
| `grant-health-check.js` | `npm run grants:health` | Health check |
| `verify-ca-grants.js` | `npm run grants:verify:ca` | Verify CA import |
| `cleanup-expired-grants.js` | `npm run grants:cleanup` | Remove expired |

### Deployment Scripts (`deployment/`)

**Purpose:** Production deployment and configuration

| Script | Command | Description |
|--------|---------|-------------|
| `setup-admin-session.js` | `npm run deploy:setup:admin` | Admin session setup |
| `setup-ollama-cloud.js` | `npm run deploy:setup:ollama` | Ollama cloud config |

### Maintenance Scripts (`maintenance/`)

**Purpose:** System health checks and service testing

| Script | Command | Description |
|--------|---------|-------------|
| `test-ollama-cloud.js` | `npm run maintenance:test:ollama` | Test Ollama |
| `test-web-search-api.js` | `npm run maintenance:test:search` | Test search API |
| `seed-maintenance-mode.js` | `npm run db:seed:maintenance` | Seed maintenance |
| `dev-restart.sh` | `./scripts/maintenance/dev-restart.sh` | Restart dev server |

---

## 🚀 Quick Start

### Initial Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed admin user (quick)
npm run db:seed:admin:simple

# Seed webinars
npm run db:seed:webinars

# Start development
npm run dev
```

### Daily Development
```bash
# Sync grants (weekly recommended)
npm run grants:sync

# Check grant counts
npm run grants:check

# Run tests
npm test
```

---

## 📝 Creating New Scripts

### 1. Choose the Right Category

- **Database operations?** → `database/`
- **Deployment tasks?** → `deployment/`
- **Maintenance/testing?** → `maintenance/`

### 2. Follow Naming Conventions

```bash
# Good names (descriptive, kebab-case)
import-ny-grants.js
seed-user-roles.js
test-stripe-webhook.js

# Bad names (too vague)
import.js
seed.js
test.js
```

### 3. Script Template

```javascript
/**
 * Script: [Script Name]
 * Purpose: [Brief description]
 * Usage: npm run [script-command]
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting [script name]...');
    
    // Your script logic here
    
    console.log('✅ [Script name] completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### 4. Add to package.json

```json
{
  "scripts": {
    "category:action": "node scripts/category/your-script.js"
  }
}
```

### 5. Document It

Add to `SCRIPTS_REFERENCE.md` and this README.

---

## 🔒 Security Notes

### Never Commit:
- ❌ API keys or secrets
- ❌ Production database URLs
- ❌ User credentials
- ❌ `.env` files

### Always:
- ✅ Use environment variables
- ✅ Validate inputs
- ✅ Log operations
- ✅ Handle errors gracefully

### Production Scripts:
```javascript
// Check environment before destructive operations
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️ Running in production! Proceed carefully...');
  // Add confirmation prompts
}
```

---

## 🧪 Testing Scripts

### Test Locally First
```bash
# Use test database
DATABASE_URL="file:./test.db" node scripts/database/your-script.js
```

### Add Error Handling
```javascript
try {
  // Your logic
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
```

### Use Dry Run Mode
```javascript
const DRY_RUN = process.env.DRY_RUN === 'true';

if (DRY_RUN) {
  console.log('📋 Dry run - would perform:', operation);
} else {
  // Actual operation
}
```

Usage:
```bash
DRY_RUN=true npm run your:script
```

---

## 📊 Script Execution Order

### For Fresh Database:
1. `npx prisma migrate deploy` - Apply migrations
2. `npm run db:seed:admin:simple` - Create admin
3. `npm run db:seed:maintenance` - Set maintenance mode
4. `npm run db:seed:webinars` - Add webinars
5. `npm run grants:sync` - Import grants

### For Grants Updates:
1. `npm run grants:check` - Check current state
2. `npm run grants:sync` - Sync new grants
3. `npm run grants:cleanup` - Remove expired
4. `npm run grants:verify:ca` - Verify CA grants (if applicable)
5. `npm run grants:health` - Final health check

---

## 🔧 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database connection failed"
```bash
# Check .env.local has DATABASE_URL
# Verify database file exists
ls -la prisma/dev.db
```

### "Permission denied"
```bash
# Make script executable (for .sh files)
chmod +x scripts/maintenance/dev-restart.sh
```

### TypeScript Scripts
```bash
# Install tsx if not present
npm install -D tsx

# Run TypeScript scripts
npm run grants:sync
```

---

## 📚 Related Documentation

- **Script Reference:** [`SCRIPTS_REFERENCE.md`](../SCRIPTS_REFERENCE.md) - Complete command reference
- **Database Schema:** [`prisma/schema.prisma`](../prisma/schema.prisma) - Database structure
- **Testing Guide:** [`tests/TESTING_GUIDE.md`](../tests/TESTING_GUIDE.md) - Testing information
- **Main README:** [`README.md`](../README.md) - Project overview

---

## 💡 Best Practices

### 1. Idempotent Scripts
Scripts should be safe to run multiple times:
```javascript
// Good: Check if exists first
const existingUser = await prisma.user.findUnique({ where: { email } });
if (!existingUser) {
  await prisma.user.create({ data });
}

// Bad: Will error if already exists
await prisma.user.create({ data });
```

### 2. Progress Logging
```javascript
console.log('🚀 Starting import...');
console.log(`📊 Processing ${total} records...`);
console.log(`✅ Completed: ${completed}/${total}`);
```

### 3. Transaction Safety
```javascript
await prisma.$transaction(async (tx) => {
  // Multiple operations that should succeed/fail together
  await tx.user.create({ data });
  await tx.organization.create({ data });
});
```

### 4. Cleanup
```javascript
finally {
  await prisma.$disconnect();
  console.log('👋 Database connection closed');
}
```

---

## 🎯 Common Use Cases

### Adding Test Data
```bash
npm run db:create:test-user
```

### Resetting Development Database
```bash
npx prisma migrate reset --force
npm run db:seed:admin:simple
npm run db:seed:webinars
```

### Production Deployment
```bash
# On production server
npm run deploy:setup:admin
npm run deploy:setup:ollama
npx prisma migrate deploy
npm run grants:sync
```

### Weekly Maintenance
```bash
npm run grants:health
npm run grants:cleanup
npm run maintenance:test:ollama
npm run maintenance:test:search
```

---

**Questions?** See [`SCRIPTS_REFERENCE.md`](../SCRIPTS_REFERENCE.md) or contact the dev team.

# Scripts Reference Guide

Quick reference for all available npm scripts in Bloomwell AI.

---

## 📋 Table of Contents

- [Development](#development)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Database Operations](#database-operations)
- [Grants Management](#grants-management)
- [Deployment](#deployment)
- [Maintenance](#maintenance)

---

## 🚀 Development

### Start Development Server
```bash
npm run dev
```
Starts Next.js development server at http://localhost:3000

### Build for Production
```bash
npm run build
```
Creates optimized production build with Turbopack

### Start Production Server
```bash
npm run start
```
Runs the production build (requires `npm run build` first)

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```
Runs the complete test suite (70 tests)

### Test by Category
```bash
npm run test:unit          # Unit tests (21 tests)
npm run test:integration   # Integration tests (20 tests)
npm run test:e2e           # End-to-end tests (29 tests)
```

### Development Testing
```bash
npm run test:watch         # Watch mode - auto-rerun on changes
npm run test:coverage      # Generate coverage report
```

---

## 🔍 Code Quality

### Linting
```bash
npm run lint               # Check for linting errors
npm run lint:fix           # Auto-fix linting errors
```

### Formatting
```bash
npm run format             # Format all files with Prettier
npm run format:check       # Check if files are formatted
```

### Type Checking
```bash
npm run type-check         # Run TypeScript compiler checks
```

### Pre-Commit Checks
```bash
npm run lint && npm run type-check && npm test
```

---

## 💾 Database Operations

### Seed Admin Users
```bash
npm run db:seed:admin          # Seed full admin user with all fields
npm run db:seed:admin:simple   # Seed basic admin user (quick setup)
```

### Seed Content
```bash
npm run db:seed:webinars          # Seed webinar examples
npm run db:seed:templates         # Seed email templates
npm run db:seed:notifications     # Seed notification templates
npm run db:seed:maintenance       # Seed maintenance mode settings
```

### Database Utilities
```bash
npm run db:create:test-user    # Create a test user account
npm run db:clear:test-org      # Clear test organization data
npm run db:fix:trial-dates     # Fix trial date inconsistencies
```

### Prisma Commands
```bash
npx prisma generate            # Regenerate Prisma Client
npx prisma migrate dev         # Create and apply migration
npx prisma migrate deploy      # Apply migrations (production)
npx prisma db push             # Push schema without migration
npx prisma studio              # Open Prisma Studio GUI
npx prisma db seed             # Run seed file
```

---

## 🎯 Grants Management

### Import Grants
```bash
npm run grants:import:ca       # Import California state grants
```

### Sync Grants
```bash
npm run grants:sync            # Sync grants from grants.gov
```

### Monitor Grants
```bash
npm run grants:check           # Check total grants count
npm run grants:health          # Run grants health check
npm run grants:verify:ca       # Verify CA grants import
```

### Maintenance
```bash
npm run grants:cleanup         # Remove expired grants
```

### Grant Script Details

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `grants:sync` | Sync federal grants from grants.gov | Daily/Weekly |
| `grants:import:ca` | Import California state grants | As needed |
| `grants:check` | Quick count verification | After imports |
| `grants:health` | Full database health check | Weekly |
| `grants:cleanup` | Remove expired grants | Monthly |

---

## 🚀 Deployment

### Admin Setup
```bash
npm run deploy:setup:admin     # Create admin session for deployment
```

### Ollama Setup
```bash
npm run deploy:setup:ollama    # Configure Ollama for cloud deployment
```

---

## 🔧 Maintenance

### Test Services
```bash
npm run maintenance:test:ollama    # Test Ollama connection
npm run maintenance:test:search    # Test web search API
```

---

## 📚 Common Workflows

### New Developer Setup
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Seed database
npm run db:seed:admin:simple
npm run db:seed:webinars

# 5. Start dev server
npm run dev

# 6. Run tests to verify
npm test
```

### Before Committing Code
```bash
# 1. Format code
npm run format

# 2. Fix linting issues
npm run lint:fix

# 3. Check types
npm run type-check

# 4. Run tests
npm test

# 5. If all pass, commit
git add .
git commit -m "your message"
```

### Deploying to Production
```bash
# 1. Run all checks
npm run lint && npm run type-check && npm test

# 2. Build production bundle
npm run build

# 3. Test production build locally
npm run start

# 4. Deploy (platform-specific)
# Vercel: git push origin main
# Manual: npm run deploy
```

### Database Reset (Development Only)
```bash
# ⚠️ WARNING: This will delete all data!

# 1. Reset database
npx prisma migrate reset --force

# 2. Reseed essential data
npm run db:seed:admin:simple
npm run db:seed:webinars
npm run db:seed:maintenance
```

### Grants Database Maintenance
```bash
# Weekly maintenance routine

# 1. Check current status
npm run grants:check

# 2. Run health check
npm run grants:health

# 3. Sync new grants
npm run grants:sync

# 4. Clean up expired grants
npm run grants:cleanup

# 5. Verify counts
npm run grants:check
```

---

## 🔑 Environment Variables

Ensure these are set in `.env.local`:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Services
OPENAI_API_KEY="your-openai-key"
PERPLEXITY_API_KEY="your-perplexity-key"

# Stripe
STRIPE_SECRET_KEY="your-stripe-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
```

---

## 📖 Script Categories Explained

### Database Scripts (`db:*`)
Located in `scripts/database/`
- Seeding and data initialization
- Test data creation
- Database maintenance

### Grants Scripts (`grants:*`)
Located in `scripts/database/`
- Federal and state grant imports
- Synchronization with external sources
- Data verification and cleanup

### Deployment Scripts (`deploy:*`)
Located in `scripts/deployment/`
- Production setup tasks
- Service configuration
- One-time deployment operations

### Maintenance Scripts (`maintenance:*`)
Located in `scripts/maintenance/`
- Service health checks
- API testing
- System diagnostics

---

## 🆘 Troubleshooting

### "Command not found: tsx"
```bash
npm install  # Installs tsx as dev dependency
```

### "Database connection failed"
```bash
# Check DATABASE_URL in .env.local
# Regenerate Prisma Client
npx prisma generate
```

### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tests Failing
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

---

## 📝 Adding New Scripts

When adding new scripts:

1. **Place in correct directory:**
   - `scripts/database/` - Database operations
   - `scripts/deployment/` - Deployment tasks
   - `scripts/maintenance/` - Maintenance utilities

2. **Follow naming convention:**
   - Use kebab-case: `my-new-script.js`
   - Be descriptive: `import-ny-grants.js` not `import.js`

3. **Add to package.json:**
   ```json
   "category:action": "node scripts/category/my-new-script.js"
   ```

4. **Document in this file:**
   - Add to appropriate section
   - Include purpose and usage
   - Note any prerequisites

---

## 🔗 Related Documentation

- **Testing Guide:** `tests/TESTING_GUIDE.md`
- **Scripts README:** `scripts/README.md`
- **Main README:** `README.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

## 💡 Tips

- Use `npm run` without arguments to see all available scripts
- Tab completion works for script names in most terminals
- Combine scripts with `&&`: `npm run lint && npm test`
- Use `;` to run scripts even if previous fails: `npm run lint; npm test`
- Prefix with `time` to measure execution: `time npm test`

---

**Last Updated:** October 18, 2025


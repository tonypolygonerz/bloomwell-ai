# Bloomwell AI Quick Reference Guide

> **Updated**: October 17, 2025 - Post-Reorganization

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"
```

## 📁 Where to Find Things

### Documentation
```bash
docs/
├── README.md                    # Start here for all documentation
├── progress-reports/2025-10/    # Latest development updates
├── implementation-guides/       # How features were implemented
├── testing/test-guides/         # How to test features
└── architecture/               # System architecture
```

**Quick Links:**
- 📖 [Documentation Index](docs/README.md)
- 🏗️ [Project Structure](PROJECT_STRUCTURE.md)
- ✅ [Testing Guide](tests/README.md)
- 🔧 [Scripts Guide](scripts/README.md)

### Scripts
```bash
# Database operations
node scripts/database/seed-admin.js
node scripts/database/import-ca-grants.js
node scripts/database/check-grants-count.js

# Deployment
node scripts/deployment/setup-admin-session.js

# Maintenance
node scripts/maintenance/test-ollama-cloud.js
bash scripts/maintenance/dev-restart.sh
```

### Tests
```bash
# Run specific test suites
npm test -- tests/unit
npm test -- tests/integration
npm test -- tests/e2e

# Run with coverage
npm test -- --coverage
```

## 🎯 Common Tasks

### Development
```bash
# Start development server
npm run dev

# Access local server
http://localhost:3000

# Access admin dashboard
http://localhost:3000/admin
```

### Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Seed database
node scripts/database/seed-admin.js
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.test.ts
```

### Git Workflow
```bash
# Check status
git status

# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "Your commit message"

# Push to remote
git push origin feature/your-feature-name
```

## 📝 File Locations After Reorganization

### Before → After
```bash
# Documentation
ADMIN_FIX_COMPLETE.md → docs/fixes-and-patches/admin-fix.md
SESSION_OCT_16_2025.md → docs/progress-reports/2025-10/october-16.md
STRIPE_SETUP.md → docs/implementation-guides/stripe-setup.md

# Scripts
scripts/seed-admin.js → scripts/database/seed-admin.js
scripts/setup-ollama-cloud.js → scripts/deployment/setup-ollama-cloud.js
```

## 🔧 Configuration Files

### Environment Variables
```bash
# Local development
.env.local

# Required variables:
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Key Config Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript config
- `next.config.ts` - Next.js config
- `tailwind.config.ts` - Tailwind CSS config
- `prisma/schema.prisma` - Database schema

## 🎨 Theme Guidelines

### Colors
**Public Pages (Green):**
- Primary: `#10B981` (emerald-500)
- Used on: homepage, auth, webinars, dashboard, pricing

**Admin Pages (Purple):**
- Primary: Purple theme
- Used on: admin dashboard, super admin tools

### Components
```tsx
// Public page button
<button className="bg-emerald-500 hover:bg-emerald-600">

// Admin page button
<button className="bg-purple-600 hover:bg-purple-700">
```

## 📊 Key Metrics

**Project Stats:**
- 58 documentation files
- 20 utility scripts
- 112 source files (TypeScript/TSX)
- 35 React components
- 73K+ federal grants in database

**Business Model:**
- Monthly: $29.99/month
- Annual: $209/year (42% discount)
- Free trial: 14 days

## 🔗 Important URLs

**Development:**
- Local: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api

**Production:**
- Domain: bloomwell-ai.com
- Company: polygonerz.com

## 🐛 Troubleshooting

### Common Issues

**Database connection error:**
```bash
# Check DATABASE_URL in .env.local
# Regenerate Prisma client
npx prisma generate
```

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📚 Documentation Structure

```bash
docs/
├── README.md                    # Documentation index
├── progress-reports/            # Development progress
│   └── 2025-10/                # October 2025 reports
├── implementation-guides/       # Feature implementations
├── fixes-and-patches/          # Bug fixes
├── testing/                    # Testing docs
│   ├── test-guides/           # How to test
│   └── results/               # Test results
├── api/                        # API documentation
├── deployment/                 # Deployment guides
├── development/                # Dev setup
└── architecture/               # System architecture
```

## 🚦 GitHub Workflow

### Creating Issues
1. Go to Issues tab
2. Click "New Issue"
3. Select template (Bug Report or Feature Request)
4. Fill in all sections
5. Submit

### Creating Pull Requests
1. Create feature branch
2. Make changes
3. Commit and push
4. Open PR with template
5. Fill in all sections
6. Request review

### CI/CD
- Automated tests run on push
- Linting and type checking
- Build verification

## 🎯 Next Steps

### For New Developers
1. Read [Documentation Index](docs/README.md)
2. Set up environment
3. Run development server
4. Explore codebase
5. Read [Project Structure](PROJECT_STRUCTURE.md)

### For Contributors
1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Submit PR

### For Maintainers
1. Review PRs
2. Run tests
3. Merge to main
4. Deploy to production

## 📞 Support

**Questions?**
- Check documentation in `/docs/`
- Review README files in each directory
- See [Project Structure](PROJECT_STRUCTURE.md)
- Contact: New Berlin (Polygonerz LLC)

**Found a bug?**
- Create issue using bug report template
- Include steps to reproduce
- Provide error messages

**Need a feature?**
- Create issue using feature request template
- Describe nonprofit use case
- Explain expected behavior

---

**Last Updated**: October 17, 2025  
**Version**: Post-Reorganization  
**Status**: ✅ Production Ready







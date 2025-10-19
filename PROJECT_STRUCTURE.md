# Bloomwell AI Project Structure

This document provides a comprehensive overview of the Bloomwell AI project structure after reorganization (October 2025).

## 📊 Directory Overview

```
nonprofit-ai-assistant/
├── .github/              # GitHub configuration
├── docs/                 # All documentation
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── scripts/             # Utility scripts
├── src/                 # Application source code
├── tests/               # Test suites
└── [config files]       # Various configuration files
```

## 🗂️ Detailed Structure

### `.github/` - GitHub Configuration
```
.github/
├── workflows/           # CI/CD workflows
│   └── ci.yml          # Continuous integration
├── ISSUE_TEMPLATE/     # Issue templates
│   ├── bug_report.md
│   └── feature_request.md
├── PULL_REQUEST_TEMPLATE.md
├── CODEOWNERS          # Code review assignments
└── README.md           # GitHub config docs
```

### `docs/` - Documentation
```
docs/
├── progress-reports/    # Development progress
│   ├── 2025-10/        # October 2025 reports
│   └── monthly-summaries/
├── implementation-guides/  # Feature implementation docs
├── fixes-and-patches/     # Bug fixes and patches
├── testing/               # Testing documentation
│   ├── test-guides/      # Testing instructions
│   └── results/          # Test results
├── api/                   # API documentation
├── deployment/            # Deployment guides
├── development/           # Development setup
├── architecture/          # System architecture
└── README.md             # Documentation index
```

### `scripts/` - Utility Scripts
```
scripts/
├── database/           # Database scripts
│   ├── seed-*.js      # Database seeding
│   ├── import-*.js    # Data import
│   ├── fix-*.js       # Data fixes
│   └── *-health-check.js
├── deployment/         # Deployment scripts
│   └── setup-*.js
├── maintenance/        # Maintenance scripts
│   ├── test-*.js
│   └── dev-restart.sh
└── README.md          # Scripts documentation
```

### `tests/` - Test Suites
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── README.md         # Testing guide
```

### `src/` - Application Source
```
src/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── auth/        # Authentication pages
│   ├── admin/       # Admin dashboard
│   ├── profile/     # User profile pages
│   ├── chat/        # AI assistant
│   ├── dashboard/   # User dashboard
│   ├── grants/      # Grant search
│   ├── pricing/     # Pricing page
│   └── webinars/    # Webinar platform
├── components/       # React components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── types/           # TypeScript types
└── middleware.ts    # Next.js middleware
```

### `prisma/` - Database
```
prisma/
├── schema.prisma    # Database schema
├── migrations/      # Database migrations
└── seed-*.ts       # Seed data
```

## 🎯 Key Files

### Root Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `eslint.config.mjs` - ESLint configuration
- `jest.config.js` - Jest testing configuration
- `README.md` - Project README

### Environment Files (Not in Git)
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables

## 📂 File Organization Principles

### Documentation
- **Date-based**: Progress reports organized by date
- **Category-based**: Fixes, guides, and testing organized by type
- **Hierarchical**: Subdirectories for better organization

### Scripts
- **Functional**: Organized by purpose (database, deployment, maintenance)
- **Descriptive naming**: Clear indication of script purpose
- **Centralized**: All scripts in one location

### Tests
- **Test type**: Separated by unit, integration, and e2e
- **Mirrored structure**: Tests mirror source structure
- **Isolated**: Each test type in its own directory

### Source Code
- **Feature-based**: Organized by feature/domain
- **Next.js conventions**: Follows Next.js 15 app directory structure
- **Component hierarchy**: Shared components at top level

## 🔄 Migration Notes

### Changes Made (October 17, 2025)
1. ✅ Created `.github/` directory with workflows and templates
2. ✅ Reorganized 40+ documentation files into structured directories
3. ✅ Organized scripts into functional subdirectories
4. ✅ Created `tests/` directory structure
5. ✅ Added comprehensive README files to all major directories
6. ✅ Maintained all existing functionality

### Files Relocated
- All root-level `*.md` files moved to appropriate `docs/` subdirectories
- All scripts organized into `scripts/database/`, `scripts/deployment/`, and `scripts/maintenance/`
- Old structure preserved in git history

### Breaking Changes
None - all files moved, not deleted. Git history preserved.

## 🎨 Design Themes

### Public Pages (Green Theme)
- Homepage
- Authentication pages
- Webinars
- User dashboard
- Pricing

### Admin Pages (Purple Theme)
- Admin dashboard
- Super admin functionality
- Internal management tools

## 📊 Project Statistics

- **Total Files**: 300+
- **Source Files**: 112 TypeScript/TSX files
- **Documentation**: 40+ markdown files (now organized)
- **Scripts**: 20+ utility scripts
- **Dependencies**: 50+ npm packages

## 🚀 Getting Started

1. **Read documentation**: Start with `/docs/README.md`
2. **Setup environment**: Follow `/docs/development/environment-verification.md`
3. **Review architecture**: See `/docs/architecture/codebase-file-map.md`
4. **Run scripts**: Check `/scripts/README.md` for available scripts
5. **Write tests**: Follow guidelines in `/tests/README.md`

## 📝 Maintenance

### Adding New Files
- Documentation → `/docs/[category]/filename.md`
- Scripts → `/scripts/[category]/filename.js`
- Tests → `/tests/[type]/path/to/test.test.ts`
- Source → `/src/[feature]/filename.tsx`

### Updating Documentation
1. Update relevant file in `/docs/`
2. Update `/docs/README.md` if adding new categories
3. Update this file if changing structure

### Best Practices
- Keep documentation current
- Use descriptive file names
- Follow existing conventions
- Update READMEs when adding files
- Maintain consistent structure

## 🔗 Related Documentation

- [Documentation Index](/docs/README.md)
- [Scripts Documentation](/scripts/README.md)
- [Testing Guide](/tests/README.md)
- [GitHub Configuration](/.github/README.md)
- [Main README](/README.md)

## 📞 Questions?

For questions about project structure:
- Check relevant README files
- See documentation in `/docs/`
- Review git history for changes
- Contact: New Berlin (Polygonerz LLC)






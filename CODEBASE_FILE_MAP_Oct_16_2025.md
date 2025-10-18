 # Bloomwell AI - Complete Codebase File Map
**Generated:** Friday, October 17, 2025  
**Product:** Bloomwell AI (formerly nonprofit-ai-assistant)  
**Company:** Polygonerz LLC  
**Tech Stack:** Next.js 15.5.2, TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS, NextAuth.js

---

## 📋 Project Overview

**Business Model:** $29.99/month or $209/year with 14-day free trial  
**Target Users:** Nonprofits under $3M budget, social enterprises, faith-based organizations  
**Key Features:** 73K+ federal grants database, AI chat assistant, webinar management, document processing

---

## 🏗️ Root Configuration Files

```
├── package.json                    # Dependencies & scripts (Next.js 15.5.2, React 19.1.0)
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── postcss.config.mjs              # PostCSS configuration
├── eslint.config.mjs               # ESLint configuration
├── jest.config.js                  # Jest testing configuration
├── jest.setup.js                   # Jest setup
├── README.md                       # Project documentation
└── .env.local                      # Environment variables (not in repo)
```

---

## 📂 Source Code Structure (`/src`)

### Main Application Directory (`/src/app`)

#### **Root Pages**
```
src/app/
├── layout.tsx                      # Root layout with providers
├── page.tsx                        # Homepage (green branding)
├── globals.css                     # Global styles
├── animations.css                  # Custom animations
├── favicon.ico                     # Site favicon
└── middleware.ts                   # Route protection & auth middleware
```

#### **Authentication Pages** (`/src/app/auth`)
```
auth/
├── login/page.tsx                  # Standard login page
├── login-new/page.tsx              # New login design
├── signin/page.tsx                 # Sign-in variant
├── register/page.tsx               # Registration page
├── verify-email/page.tsx           # Email verification
├── forgot-password/page.tsx        # Password reset request
└── reset-password/page.tsx         # Password reset form
```

#### **Admin Dashboard** (`/src/app/admin`) - Purple Theme
```
admin/
├── layout.tsx                      # Admin layout wrapper
├── page.tsx                        # Admin dashboard home
├── login/page.tsx                  # Admin login (separate from user auth)
├── analytics/page.tsx              # Analytics dashboard
├── grants/page.tsx                 # Grants management
├── maintenance/page.tsx            # Maintenance mode control
├── notifications/page.tsx          # Notification management
├── ai-models/page.tsx              # AI model configuration
├── test/page.tsx                   # Admin testing tools
├── users/
│   ├── page.tsx                    # User list & management
│   └── [id]/page.tsx               # Individual user details
└── webinars/
    ├── page.tsx                    # Webinar list
    ├── new/page.tsx                # Create new webinar
    ├── search/page.tsx             # Webinar search
    └── [id]/edit/page.tsx          # Edit webinar
```

#### **User Dashboard & Features**
```
src/app/
├── dashboard/page.tsx              # Main user dashboard
├── chat/
│   ├── page.tsx                    # Chat list
│   └── [id]/page.tsx               # Individual chat session
├── documents/page.tsx              # Document management
├── notifications/page.tsx          # User notifications
├── templates/
│   ├── page.tsx                    # Template library
│   └── workflow/[projectId]/page.tsx  # Workflow editor
└── onboarding/
    └── organization/page.tsx       # Organization onboarding
```

#### **Profile Management** (`/src/app/profile`)
Progressive onboarding system with 8 sections:
```
profile/
├── page.tsx                        # Profile overview/hub
├── basics/page.tsx                 # Basic organization info
├── budget/page.tsx                 # Budget information
├── documents/page.tsx              # Document uploads
├── goals/page.tsx                  # Organization goals
├── programs/page.tsx               # Programs & services
├── story/page.tsx                  # Organization story/mission
└── team/page.tsx                   # Team member management
```

#### **Public Webinars** (`/src/app/webinars`) - Green Theme
```
webinars/
├── page.tsx                        # Webinar listing page
├── WebinarsClient.tsx              # Client-side webinar logic
├── WebinarsContent.tsx             # Webinar content component
└── [slug]/page.tsx                 # Individual webinar detail

webinar/[slug]/
├── page.tsx                        # Webinar detail page (alternative route)
└── WebinarDetailClient.tsx         # Client component for webinar details
```

#### **Pricing**
```
pricing/
└── page.tsx                        # Pricing page with toggle (monthly/annual)
```

#### **Maintenance**
```
maintenance/
└── page.tsx                        # Maintenance mode page
```

---

## 🔌 API Routes (`/src/app/api`)

### **Admin APIs** (`/src/app/api/admin`)
```
admin/
├── auth/route.ts                   # Admin authentication
├── stats/route.ts                  # Admin statistics
├── ai-models/route.ts              # AI model management
├── maintenance/route.ts            # Maintenance mode toggle
├── grants/sync/route.ts            # Grants synchronization
├── analytics/
│   ├── route.ts                    # Analytics data
│   └── export/route.ts             # Export analytics
├── notifications/route.ts          # Notification CRUD
├── notification-templates/route.ts # Notification templates
├── upload/route.ts                 # File upload handler
├── user-stats/route.ts             # User statistics
├── users/
│   ├── route.ts                    # User list & operations
│   ├── [id]/route.ts               # Individual user operations
│   └── export/route.ts             # Export user data
├── webinars/
│   ├── route.ts                    # Webinar CRUD
│   ├── [id]/route.ts               # Individual webinar operations
│   └── search/route.ts             # Webinar search
└── webinar-notifications/route.ts # Webinar notification management
```

### **Authentication APIs** (`/src/app/api/auth`)
```
auth/
├── [...nextauth]/
│   ├── route.ts                    # NextAuth.js handler
│   └── auth-config.ts              # NextAuth configuration
├── register/route.ts               # User registration
├── forgot-password/route.ts        # Password reset request
└── reset-password/route.ts         # Password reset execution
```

### **Chat & AI APIs**
```
chat/
├── route.ts                        # Main chat endpoint
└── cloud/route.ts                  # Cloud AI model endpoint

chat-hybrid/route.ts                # Hybrid chat (local + cloud)

conversations/
├── route.ts                        # Conversation list
└── [id]/route.ts                   # Individual conversation
```

### **Grants APIs** (`/src/app/api/grants`)
```
grants/
├── search/                         # Grant search endpoint
└── statistics/                     # Grant statistics
```

### **Webinar APIs** (`/src/app/api/webinars`)
```
webinars/
├── route.ts                        # Webinar list
└── [slug]/
    ├── route.ts                    # Webinar details
    ├── rsvp/route.ts               # RSVP submission
    └── has-rsvp/route.ts           # Check RSVP status
```

### **Organization APIs**
```
organization/route.ts               # Organization CRUD
organization-search/route.ts        # Organization lookup (ProPublica)
organizations/search/route.ts       # Organization search
```

### **Onboarding APIs** (`/src/app/api/onboarding`)
```
onboarding/
├── progress/route.ts               # Get/update onboarding progress
└── sections/
    ├── basics/route.ts             # Basic info section
    ├── budget/route.ts             # Budget section
    ├── documents/route.ts          # Documents section
    ├── funding/route.ts            # Funding section
    ├── goals/route.ts              # Goals section
    ├── programs/route.ts           # Programs section
    ├── story/route.ts              # Story section
    └── team/route.ts               # Team section
```

### **Template & Document APIs**
```
templates/
├── dashboard/route.ts              # Template dashboard data
├── start/route.ts                  # Start new template
├── pdf-enhance/route.ts            # PDF enhancement
└── workflow/
    └── [projectId]/
        ├── route.ts                # Workflow operations
        └── step/route.ts           # Workflow step operations

pdf/process/route.ts                # PDF processing
```

### **User APIs** (`/src/app/api/user`)
```
user/
├── trial-status/route.ts           # Trial period status
├── intelligence/route.ts           # User intelligence profile
└── events/route.ts                 # User event tracking
```

### **Utility APIs**
```
emails/reminder/route.ts            # Email reminder system
notifications/route.ts              # User notifications
web-search/route.ts                 # Web search functionality
web-fetch/route.ts                  # Web content fetching
maintenance/status/route.ts         # Maintenance status check
create-checkout-session/route.ts    # Stripe checkout
```

---

## 🎨 React Components (`/src/components`)

### **Layout Components**
```
components/
├── Providers.tsx                   # App-level providers (session, pricing context)
├── Navigation.tsx                  # Main navigation bar
├── HomeFooter.tsx                  # Homepage footer
├── layout/
│   ├── AppLayout.tsx               # Main app layout wrapper
│   └── Sidebar.tsx                 # App sidebar navigation
```

### **Admin Components**
```
├── AdminLayout.tsx                 # Admin layout wrapper (purple theme)
├── AdminSidebar.tsx                # Admin sidebar navigation
├── AdminBreadcrumb.tsx             # Admin breadcrumb navigation
├── AdminSearchFilters.tsx          # Admin search/filter UI
├── admin-login-form.tsx            # Admin login form
```

### **Authentication Components**
```
├── login-form.tsx                  # User login form
├── register-form.tsx               # User registration form
├── LogoutButton.tsx                # Logout button
└── auth/
    ├── ProgressiveRegistrationForm.tsx  # Progressive registration flow
    └── OrganizationSearchField.tsx      # Organization search (ProPublica API)
```

### **Dashboard Widgets**
```
├── TrialBanner.tsx                 # Trial period banner
├── CompleteYourProfileWidget.tsx   # Profile completion widget
├── UpcomingEventsWidget.tsx        # Upcoming events display
├── PDFUsageWidget.tsx              # PDF usage statistics
├── NotificationBell.tsx            # Notification bell icon
```

### **Feature Components**
```
├── ChatPromptSuggestions.tsx       # AI chat prompt suggestions
├── IntelligenceProfileManager.tsx  # User intelligence profile UI
├── PDFUploader.tsx                 # PDF upload component
├── OrganizationSearch.tsx          # Organization search component
├── OnlinePermissionModal.tsx       # Online feature permission modal
```

### **Marketing/Public Components**
```
├── FeaturesGrid.tsx                # Features grid display
├── ParallaxSections.tsx            # Parallax scroll sections
├── CompetitiveComparison.tsx       # Competitive comparison table
├── FAQSection.tsx                  # FAQ accordion
├── ROICalculator.tsx               # ROI calculator widget
```

### **Pricing Components**
```
├── PricingCard.tsx                 # Individual pricing card
├── PricingToggle.tsx               # Monthly/Annual toggle
```

### **Webinar Components**
```
├── WebinarCalendar.tsx             # Webinar calendar view
├── UpgradeButton.tsx               # Upgrade to premium button
```

### **Utility Components**
```
└── AIModelBadge.tsx                # AI model status badge
```

---

## 🔧 Library/Utilities (`/src/lib`)

### **Core Utilities**
```
lib/
├── prisma.ts                       # Prisma client singleton
├── email.ts                        # Email utilities (legacy)
├── email-service.ts                # Email service (Resend)
├── maintenance.ts                  # Maintenance mode utilities
```

### **AI & Chat**
```
├── ollama-cloud-client.ts          # Ollama Cloud API client
├── guideline-selector.ts           # AI guideline selection logic
├── __test-guidelines__.ts          # Test AI guidelines
├── user-intelligence-utils.ts      # User intelligence tracking
```

### **Grant Management**
```
├── grants-sync.ts                  # Grant synchronization utilities
```

### **Document Processing**
```
├── pdf-processor.ts                # PDF processing utilities
├── xml-parser.ts                   # XML parsing utilities
```

### **Templates & Workflows**
```
├── template-system-utils.ts        # Template system utilities
├── template-pdf-integration.ts     # Template PDF integration
```

### **Profile & Onboarding**
```
├── profile-completeness.ts         # Profile completeness calculation
```

### **Admin**
```
├── admin-auth.ts                   # Admin authentication utilities
```

### **Data Handling**
```
├── json-field-middleware.ts        # JSON field middleware
└── json-field-utils.ts             # JSON field utilities
```

---

## 🪝 Custom Hooks (`/src/hooks`)

```
hooks/
├── useHybridChat.ts                # Hybrid chat hook (local + cloud AI)
└── use-mobile.tsx                  # Mobile detection hook
```

---

## 🎯 Context Providers (`/src/contexts`)

```
contexts/
└── PricingContext.tsx              # Pricing state management (monthly/annual)
```

---

## 📊 TypeScript Types (`/src/types`)

```
types/
└── json-fields.ts                  # JSON field type definitions

/types/ (root)
└── next-auth.d.ts                  # NextAuth type extensions
```

---

## 🗄️ Database (`/prisma`)

### **Schema & Migrations**
```
prisma/
├── schema.prisma                   # Main Prisma schema
├── schema.backup.20251009.prisma   # Schema backup
├── dev.db                          # SQLite development database
├── seed-guidelines.ts              # AI guidelines seed data
└── migrations/
    ├── 20250913223958_initial_schema_with_grants/
    ├── 20250921030927_add_public_webinar_fields/
    ├── 20250923043152_add_trial_management_fields/
    ├── 20250926045529_add_pdf_processing/
    ├── 20251005055928_add_ai_guidelines/
    ├── 20251005072100_add_organization_type_and_state/
    ├── 20251005081557_add_web_search_logging/
    ├── 20251010000408_add_maintenance_mode/
    ├── 20251016235755_add_document_model_and_relations/
    └── migration_lock.toml
```

### **Key Database Models** (from schema.prisma)
- **User** - User accounts with trial management
- **Organization** - Nonprofit organization profiles (8-section progressive onboarding)
- **Grant** - Federal grant database (73K+ records)
- **Webinar** - Public webinar management
- **WebinarRSVP** - Webinar registrations
- **Conversation** - Chat conversations
- **Message** - Chat messages
- **Template** - Document templates
- **WorkflowProject** - Multi-step workflows
- **Document** - Uploaded documents
- **Notification** - User notifications
- **MaintenanceMode** - Maintenance mode configuration
- **AIGuideline** - AI behavior guidelines
- **WebSearchLog** - Web search tracking
- **UserEvent** - User event tracking
- **UserIntelligence** - User intelligence profiles

---

## 🔨 Scripts (`/scripts`)

### **Admin & Setup**
```
scripts/
├── seed-admin.js                   # Seed admin user
├── seed-admin-simple.js            # Simple admin seed
├── setup-admin-session.js          # Setup admin session
├── create-test-user.js             # Create test user
├── clear-test-organization.js      # Clear test data
```

### **Database Maintenance**
```
├── fix-trial-dates.js              # Fix trial date issues
```

### **Grant Management**
```
├── import-ca-grants.js             # Import California grants
├── verify-ca-grants.js             # Verify CA grant import
├── check-grants-count.js           # Check grant counts
├── cleanup-expired-grants.js       # Remove expired grants
├── grant-health-check.js           # Grant database health check
├── sync-grants-now.ts              # Manual grant sync
```

### **Template & Content Seeding**
```
├── seed-templates.js               # Seed document templates
├── seed-webinars.js                # Seed webinar data
├── seed-notification-templates.js  # Seed notification templates
├── seed-maintenance-mode.js        # Seed maintenance mode
```

### **AI & External Services**
```
├── setup-ollama-cloud.js           # Setup Ollama Cloud
├── test-ollama-cloud.js            # Test Ollama Cloud connection
├── test-web-search-api.js          # Test web search API
```

### **Testing**
```
├── test-organization-api.js        # Test organization API
└── test-pricing-api.js             # Test pricing API
```

### **Utilities**
```
├── dev-restart.sh                  # Development server restart
└── test-github-ssh.sh              # Test GitHub SSH connection
```

---

## 📄 Public Assets (`/public`)

```
public/
├── next.svg                        # Next.js logo
├── vercel.svg                      # Vercel logo
├── file.svg                        # File icon
├── globe.svg                       # Globe icon
├── grid.svg                        # Grid icon
├── window.svg                      # Window icon
├── images/
│   └── new-berlin-headshot 2017.jpg  # Team member photo
└── uploads/
    ├── documents/                  # User document uploads
    └── thumbnails/                 # Document thumbnails
```

---

## 📚 Documentation Files

### **Progress Reports**
```
├── BLOOMWELL_AI_PROGRESS_REPORT_OCT_11-12_2025.md
├── BLOOMWELL_AI_PROGRESS_REPORT_OCT_13_2025.md
├── SESSION_OCT_16_2025.md
├── SESSION_OCT_16_2025_PHASE2.md
├── PHASE_2_COMPLETION_REPORT.md
├── PHASE_2_EXECUTIVE_SUMMARY.md
└── PHASE_2_TEST_RESULTS.md
```

### **Implementation Guides**
```
├── PROGRESSIVE_ONBOARDING_COMPLETE.md
├── PROGRESSIVE_REGISTRATION_IMPLEMENTATION.md
├── REGISTRATION_REDESIGN_COMPLETE.md
├── REGISTRATION_REDESIGN_SUMMARY.md
├── PASSWORD_RESET_IMPLEMENTATION.md
├── MAINTENANCE_MODE_IMPLEMENTATION.md
├── OLLAMA_CLOUD_IMPLEMENTATION.md
└── STRIPE_SETUP.md
```

### **Fix Documentation**
```
├── ADMIN_FIX_COMPLETE.md
├── ADMIN_USERS_FIX.md
├── AI_MODELS_TOGGLE_FIX.md
├── CHAT_PROMPT_SUGGESTIONS_COMPLETE.md
├── GOOGLE_OAUTH_BRANDING_FIX.md
├── OAUTH_FIX_SUMMARY.md
├── ONBOARDING_FIX_COMPLETE.md
├── ORGANIZATION_API_FIX.md
├── PRICING_PERFORMANCE_FIX.md
├── PRICING_SPACING_FIX.md
├── PRISMA_FIX_COMPLETE.md
├── PROPUBLICA_AUTOFILL_FIX.md
├── SECURITY_FIX_COMPLETE.md
├── SESSION_FIXES_COMPLETE.md
├── TOGGLE_FIX_SUMMARY.md
└── TRIAL_DATES_FIX_COMPLETE.md
```

### **Testing Documentation**
```
├── TESTING_INSTRUCTIONS.md
├── REGISTRATION_TESTING_GUIDE.md
├── READY_FOR_TESTING.md
├── OAUTH_TEST_CHECKLIST.md
├── PRICING_TOGGLE_TEST_GUIDE.md
└── PRICING_TEST_SUMMARY.md
```

### **Data & Operations**
```
├── CA_GRANTS_IMPORT_SUMMARY.md
├── GRANTS_CLEANUP_REPORT.md
├── GRANTS_SYNC_NONPROFIT_FILTER.md
├── DATABASE_RESET_OCT_17_2025.md
├── DATABASE_BACKUPS.log
├── BACKUP_COMPLETE_OCTOBER_9_2025.md
└── ENVIRONMENT_VERIFICATION_REPORT.md
```

### **Miscellaneous**
```
├── SHADCN_REMOVAL_REPORT.md
├── REGISTRATION_LAUNCH_READY.md
├── STARTUP_DEBUG_COMPLETE.md
└── docs/
    ├── STABLE_WORKFLOW.md
    └── WEB_SEARCH_COMPLETE.md
```

---

## 🎨 Theme Guidelines

### **Public Pages (Green Theme)**
- **Primary Color:** `#10B981` (Emerald green)
- **Pages:** Homepage, /webinars, /webinar/[slug], /pricing, /auth pages, /dashboard
- **Style:** Modern, accessible, professional nonprofit aesthetic
- **Target:** Nonprofit leaders and decision-makers

### **Admin Pages (Purple Theme)**
- **Pages:** /admin/*, all super admin functionality
- **Style:** Functional, data-dense, internal tools
- **Target:** System administrators

---

## 🔐 Environment Variables Required

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AI Services
OLLAMA_CLOUD_API_KEY=""
OLLAMA_CLOUD_URL=""

# External APIs
PROPUBLICA_API_KEY=""
SERPER_API_KEY=""  # For web search
```

---

## 📦 Key Dependencies

### **Core Framework**
- Next.js 15.5.2
- React 19.1.0
- TypeScript 5

### **Database & Auth**
- Prisma 6.15.0
- NextAuth.js 4.24.11
- bcryptjs 3.0.2

### **UI & Styling**
- Tailwind CSS 3.4.17
- Heroicons 2.2.0

### **AI & Processing**
- Ollama 0.6.0
- pdf-parse 1.1.1
- xml2js 0.6.2

### **Payment**
- Stripe 18.5.0

### **Email**
- Resend 6.1.2

### **Utilities**
- date-fns 4.1.0
- jsonwebtoken 9.0.2
- adm-zip 0.5.16

---

## 🚀 Key Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run start               # Start production server

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues
npm run format              # Format with Prettier
npm run type-check          # TypeScript type checking

# Testing
npm test                    # Run Jest tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Database
npx prisma migrate dev      # Run migrations
npx prisma studio           # Open Prisma Studio
npx prisma generate         # Generate Prisma Client
```

---

## 📊 Key Metrics & Features

- **Grants Database:** 73,000+ federal grants
- **Webinar System:** Public webinars with RSVP management
- **AI Chat:** Hybrid local/cloud AI assistant
- **Document Processing:** PDF upload and enhancement
- **Template System:** Multi-step workflow templates
- **Progressive Onboarding:** 8-section organization profile
- **Trial Management:** 14-day free trial system
- **Subscription:** Monthly ($29.99) and Annual ($209) plans
- **Admin Dashboard:** Full user and content management

---

## 🔄 Recent Major Changes (October 2025)

1. **Progressive Onboarding System** - 8-section organization profile
2. **ProPublica API Integration** - Organization autofill
3. **Profile Completeness Widget** - Dashboard widget showing completion status
4. **Trial Date Fixes** - Corrected trial period calculations
5. **California Grants Import** - Added CA state grants
6. **Chat Prompt Suggestions** - Smart AI prompt suggestions
7. **Maintenance Mode** - Admin-controlled maintenance mode
8. **Document Model** - Added document upload and management

---

## 📝 Notes for AI Coding Assistant

### **Architecture Patterns**
- Next.js App Router (not Pages Router)
- Server Components by default, Client Components marked with `'use client'`
- API routes follow REST conventions
- Prisma ORM for all database operations
- NextAuth.js for authentication

### **Code Standards**
- TypeScript with strict type checking
- Functional components only
- Prefer `type` over `interface`
- Use branded types for IDs
- ESLint + Prettier for code quality
- Self-documenting code (minimal comments)

### **Business Logic**
- Trial period: 14 days from registration
- Subscription check required for premium features
- Admin users have separate authentication
- Organization profiles are optional but encouraged
- Webinars are public but RSVP requires authentication

### **Testing Considerations**
- Test subscription logic thoroughly
- Verify trial period calculations
- Test mobile responsiveness
- Validate email deliverability
- Check grant search performance (<500ms)

---

**Last Updated:** October 17, 2025  
**Codebase Status:** Active development, production-ready core features  
**Next Priorities:** Enhanced grant matching, multi-user organizations, advanced analytics
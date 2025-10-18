# Bloomwell AI

[![CI](https://github.com/tonypolygonerz/nonprofit-ai-assistant/workflows/CI/badge.svg)](https://github.com/tonypolygonerz/nonprofit-ai-assistant/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**AI-Powered Assistant for Nonprofits, Social Enterprises, and Faith-Based Organizations**

Bloomwell AI helps nonprofit organizations under $3M budget find grants, manage applications, and access educational resources through an intelligent assistant powered by AI.

🌐 **Website:** [bloomwell-ai.com](https://bloomwell-ai.com)  
🏢 **Company:** Polygonerz LLC

---

## 🎯 Key Features

- **🔍 Grant Discovery:** Access to 73,000+ federal grants with intelligent matching
- **💬 AI Assistant:** Context-aware chat with document upload and web search capabilities
- **📚 Webinar Library:** Educational content for nonprofit leaders
- **📊 Dashboard:** Track grant applications, deadlines, and progress
- **🔐 Secure Authentication:** OAuth with Google and email/password options
- **💳 Subscription Management:** 14-day free trial, flexible monthly or annual plans

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.2 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **AI Integration:** OpenAI, Perplexity, Claude, and Ollama support
- **Payment Processing:** Stripe
- **Testing:** Jest, React Testing Library

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys (OpenAI, Perplexity, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tonypolygonerz/nonprofit-ai-assistant.git
   cd nonprofit-ai-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and database URL
   ```

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
nonprofit-ai-assistant/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # React components
│   ├── lib/              # Utility functions and configurations
│   ├── types/            # TypeScript type definitions
│   └── middleware.ts     # Next.js middleware for auth/maintenance
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── public/               # Static assets
├── scripts/              # Utility scripts for database and maintenance
├── tests/                # Unit, integration, and E2E tests
└── docs/                 # Project documentation
```

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run prettier     # Format code with Prettier
```

### Code Quality

- **Linting:** ESLint with Next.js and TypeScript rules
- **Type Checking:** Strict TypeScript configuration
- **Formatting:** Prettier for consistent code style
- **Testing:** Jest with React Testing Library

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- ✅ **Lint & Type Check:** Ensures code quality standards
- ✅ **Build Verification:** Validates successful builds
- ✅ **Automated Tests:** Runs test suite on every push

View the [CI workflow status](https://github.com/tonypolygonerz/nonprofit-ai-assistant/actions) on GitHub.

---

## 🎨 UI/UX Themes

- **Public Pages:** Green branding (#10B981) for nonprofit-facing features
- **Admin Pages:** Purple theme for internal management tools
- **Design:** Mobile-first, responsive, accessible

---

## 💰 Pricing

- **Monthly:** $29.99/month
- **Annual:** $209/year (42% discount, equivalent to $17.42/month)
- **Free Trial:** 14 days, no credit card required

---

## 🧪 Testing

Run the test suite:

```bash
npm test                    # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # End-to-end tests
```

See `tests/README.md` for detailed testing guidelines.

---

## 🚢 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Required environment variables for production:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL
- `OPENAI_API_KEY` - OpenAI API key
- `PERPLEXITY_API_KEY` - Perplexity API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials

See `.env.example` for complete list.

---

## 📚 Documentation

Additional documentation available in the `docs/` directory:

- [API Documentation](docs/api/)
- [Architecture Overview](docs/architecture/)
- [Deployment Guide](docs/deployment/)
- [Testing Guide](docs/testing/)
- [Implementation Guides](docs/implementation-guides/)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- Follow TypeScript best practices
- Write tests for new features
- Run `npm run lint` and `npm run type-check` before committing
- Use conventional commit messages
- Maintain nonprofit-specific context in all features

See [Bloomwell AI Development Standards](docs/development-standards.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

For support, please contact:
- **Email:** support@bloomwell-ai.com
- **Documentation:** [bloomwell-ai.com/docs](https://bloomwell-ai.com/docs)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/) and [Perplexity AI](https://www.perplexity.ai/)
- Grants data from federal and state sources
- Designed for the nonprofit community

---

**Made with 💚 by [Polygonerz LLC](https://polygonerz.com) for the nonprofit sector**

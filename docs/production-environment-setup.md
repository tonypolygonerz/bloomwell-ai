# Bloomwell AI Production Environment Setup Guide

This guide provides step-by-step instructions for setting up the production environment for Bloomwell AI with proper feature isolation and monitoring.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Feature Flag Configuration](#feature-flag-configuration)
3. [Monitoring Setup](#monitoring-setup)
4. [Deployment Process](#deployment-process)
5. [Rollback Procedures](#rollback-procedures)
6. [Troubleshooting](#troubleshooting)

## Environment Variables

### Required Environment Variables

Create a `.env.production` file with the following variables:

```
# Database
DATABASE_URL=postgresql://user:password@hostname:port/database

# Authentication
NEXTAUTH_URL=https://bloomwell-ai.com
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Integration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Application Settings
NEXT_PUBLIC_APP_URL=https://bloomwell-ai.com
NEXT_PUBLIC_ENVIRONMENT=production

# Feature Flags (default to enabled)
NEXT_PUBLIC_FEATURE_GRANTS_ENABLED=true
NEXT_PUBLIC_FEATURE_WEBINARS_ENABLED=true
NEXT_PUBLIC_FEATURE_CHAT_ENABLED=true
NEXT_PUBLIC_FEATURE_PDF_PROCESSING_ENABLED=true
NEXT_PUBLIC_FEATURE_SUBSCRIPTION_ENABLED=true

# Monitoring Configuration
NEXT_PUBLIC_MONITORING_API_KEY=your-monitoring-api-key
NEXT_PUBLIC_MONITORING_ENDPOINT=https://monitoring.bloomwell-ai.com/api/events
NEXT_PUBLIC_MONITORING_DEBUG=false
NEXT_PUBLIC_MONITORING_SAMPLE_RATE=0.1
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Full URL of your application | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of your application | Yes |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name (production, staging, development) | Yes |
| `NEXT_PUBLIC_FEATURE_*_ENABLED` | Feature flag toggles | Yes |
| `NEXT_PUBLIC_MONITORING_*` | Monitoring configuration | Yes |

## Feature Flag Configuration

### Setting Up Feature Flags

Feature flags are used to enable/disable features independently. This allows you to deploy code with disabled features and enable them later when they're ready.

1. **Default Configuration**: All features are enabled by default in the production environment.
2. **CI/CD Integration**: The CI/CD pipeline will automatically disable features that fail their tests.
3. **Manual Override**: You can manually override feature flags using the deployment script:

```bash
npm run deploy:disable-feature -- --feature=grants --env=production
```

### Available Feature Flags

| Flag Name | Description | Default |
|-----------|-------------|---------|
| `grants` | Grant search and matching functionality | Enabled |
| `webinars` | Nonprofit webinar platform | Enabled |
| `chat` | AI chat assistant for nonprofits | Enabled |
| `pdf_processing` | PDF document processing and analysis | Enabled |
| `subscription` | Subscription and payment processing | Enabled |

## Monitoring Setup

### Setting Up Monitoring

Bloomwell AI includes a built-in monitoring system for tracking feature health and performance.

1. **Create Monitoring Endpoint**: Set up a monitoring endpoint to receive events from the application.
2. **Configure Environment Variables**: Set the monitoring environment variables in your `.env.production` file.
3. **Dashboard Setup**: Set up a monitoring dashboard to visualize the data.

### Monitoring Metrics

The monitoring system tracks the following metrics for each feature:

- **Error Count**: Number of errors encountered
- **Render Count**: Number of successful renders
- **Average Render Time**: Average time to render the feature
- **Last Error**: Timestamp and message of the last error

### Alerting

Set up alerts for the following conditions:

1. **Error Rate**: Alert if the error rate for a feature exceeds 1% of renders
2. **Render Time**: Alert if the average render time exceeds 500ms
3. **Feature Disabled**: Alert if a feature is automatically disabled by the CI/CD pipeline

## Deployment Process

### Deployment Steps

1. **Build Application**:
   ```bash
   npm run build
   ```

2. **Verify Feature Status**:
   ```bash
   npm run ci:verify-features
   ```

3. **Deploy to Production**:
   ```bash
   npm run deploy:production
   ```

4. **Verify Deployment**:
   ```bash
   npm run maintenance:test:ollama
   npm run maintenance:test:search
   ```

### Deployment Schedule

- **Staging Deployment**: Every successful merge to the `development` branch
- **Production Deployment**: Every successful merge to the `main` branch
- **Hotfix Deployment**: Manual deployment from a `hotfix/*` branch

## Rollback Procedures

### Automatic Rollbacks

The CI/CD pipeline will automatically disable features that fail their tests. This prevents broken features from being deployed to production.

### Manual Rollbacks

If a feature needs to be rolled back manually:

1. **Disable the Feature**:
   ```bash
   npm run deploy:disable-feature -- --feature=feature_name --env=production
   ```

2. **Verify the Feature is Disabled**:
   ```bash
   npm run ci:verify-features
   ```

3. **Create a Fix**:
   Create a fix for the issue and deploy it through the normal CI/CD pipeline.

### Full Rollback

If a full rollback is needed:

1. **Revert to Previous Deployment**:
   ```bash
   npm run deploy:rollback -- --env=production
   ```

2. **Verify Rollback**:
   ```bash
   npm run maintenance:test:ollama
   npm run maintenance:test:search
   ```

## Troubleshooting

### Common Issues

1. **Feature Disabled Unexpectedly**:
   - Check the CI/CD logs for test failures
   - Verify the feature flag environment variables
   - Check the monitoring dashboard for errors

2. **Monitoring Not Working**:
   - Verify the monitoring environment variables
   - Check the network requests to the monitoring endpoint
   - Ensure the monitoring service is running

3. **CI/CD Pipeline Failures**:
   - Check the GitHub Actions logs
   - Verify the feature tests are passing locally
   - Check for environment variable issues

### Support

For additional support, contact the Bloomwell AI development team:

- **Email**: dev@bloomwell-ai.com
- **Slack**: #bloomwell-production channel

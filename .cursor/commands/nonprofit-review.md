# /nonprofit-review

Apply Bloomwell AI's comprehensive .cursorrules to code review with nonprofit-specific focus.

## Purpose

This command ensures all code changes align with our nonprofit-focused development standards, maintaining consistency with our mission to serve organizations under $3M budget.

## Key Review Areas

### 1. Nonprofit Domain Alignment

- **Function naming**: Use descriptive names reflecting nonprofit context (e.g., `calculateGrantDeadline`, `validateOrganizationProfile`)
- **Business logic**: Ensure features provide value justifying $29.99/month subscription
- **User experience**: Professional, accessible design for nonprofit leaders
- **Data sensitivity**: Proper handling of organization and funding information

### 2. Tech Stack Compliance

- **Next.js 15.5.2**: Use latest patterns and optimizations
- **TypeScript**: Prefer 'type' over 'interface', use branded types for IDs
- **Prisma ORM**: Schema extensions only, never destructive table modifications
- **Tailwind CSS**: Mobile-first responsive design, utilities only

### 3. UI/UX Theme Verification

- **Public pages** (/, /webinars, /webinar/[slug], auth pages): Bloomwell AI green (#10B981)
- **Admin pages** (/admin/\*): Keep existing purple theme unchanged
- **Loading states**: Required for all async operations
- **Error boundaries**: Graceful degradation for network issues

### 4. Subscription Logic Integrity

- **Trial period**: 14 days, no credit card required, tamper-proof
- **Pricing**: $29.99/month or $209/year (42% discount)
- **Premium features**: Subscription status check required
- **Conversion tracking**: Trial-to-paid metrics

### 5. Performance Standards

- **Webinar pages**: Load under 2 seconds
- **Grant search**: Results under 500ms
- **Database queries**: Optimized for 10K+ users
- **Image optimization**: Thumbnails and speaker photos

### 6. Security & Compliance

- **Access controls**: Proper nonprofit data protection
- **Input validation**: Especially organization data
- **Rate limiting**: RSVP endpoints protected
- **Audit logging**: Subscription changes and grant access

## Common Integration Points

- **73K+ federal grants**: Preserve existing functionality
- **Admin dashboard**: Maintain purple theme consistency
- **Authentication**: NextAuth.js integration
- **Email services**: Transactional message reliability

## Code Quality Checklist

- [ ] Functional components with TypeScript interfaces
- [ ] Self-documenting code, minimal comments
- [ ] Proper error handling for nonprofit context
- [ ] Mobile responsiveness tested
- [ ] SEO optimization for public pages
- [ ] Prettier formatting applied
- [ ] Type checking and linting passed

## Nonprofit-Specific Gotchas

- Grant deadline tracking is mission-critical
- Webinar content must be professional for nonprofit leaders
- Multi-user organization accounts should be future-proofed
- External API failures need graceful degradation
- Trial period logic must be bulletproof

## Testing Requirements

- Unit tests for grant matching algorithms
- Integration tests for payment logic
- Webinar RSVP flow testing
- Email deliverability verification
- Annual vs monthly pricing logic validation

## Usage

Apply this review process to any code changes, ensuring they meet our nonprofit-focused standards and maintain the high quality expected for organizations serving social good.

# /template-check

Review template system implementations for consistency with Bloomwell AI standards and nonprofit requirements.

## Purpose

Ensure all template systems (email, notification, UI components) follow our nonprofit-focused design patterns and maintain professional quality for organizations under $3M budget.

## Template System Review Areas

### 1. Email Templates

- **Professional tone**: Appropriate for nonprofit leaders and board members
- **Brand consistency**: Bloomwell AI green (#10B981) for public communications
- **Content clarity**: Clear, actionable information for busy nonprofit staff
- **Mobile optimization**: Readable on all devices
- **Accessibility**: Proper contrast ratios and alt text

### 2. Notification Templates

- **Urgency levels**: Grant deadlines, webinar reminders, subscription alerts
- **Personalization**: Organization name, specific grant opportunities
- **Action buttons**: Clear CTAs for RSVPs, grant applications, upgrades
- **Frequency limits**: Prevent notification fatigue
- **Trial period messaging**: Encourage conversion without pressure

### 3. UI Component Templates

- **Theme compliance**: Green for public, purple for admin
- **Responsive design**: Mobile-first approach
- **Loading states**: Skeleton screens for async operations
- **Error states**: Helpful messages for nonprofit context
- **Empty states**: Encouraging guidance for new users

### 4. Database Template Patterns

- **Prisma schema**: Consistent naming conventions
- **Relations**: Proper cascade deletes and foreign keys
- **Validation**: Organization data integrity
- **Indexing**: Performance optimization for 10K+ users
- **Migration safety**: Non-destructive schema changes

## Template Quality Standards

### Content Guidelines

- **Nonprofit language**: Use terms like "mission," "impact," "funding opportunities"
- **Professional tone**: Respectful of limited resources and time constraints
- **Clear value proposition**: Justify $29.99/month subscription
- **Actionable insights**: Specific next steps for users
- **Compliance awareness**: Grant requirements, reporting deadlines

### Technical Requirements

- **TypeScript interfaces**: Proper typing for all template data
- **Error handling**: Graceful fallbacks for missing data
- **Performance**: Optimized rendering for large datasets
- **Caching**: Strategic caching for frequently accessed templates
- **Testing**: Unit tests for template logic

### Integration Points

- **Grant system**: 73K+ federal grants integration
- **Webinar system**: RSVP and reminder templates
- **Subscription system**: Trial and payment notifications
- **Admin dashboard**: Purple theme consistency
- **Email service**: Reliable delivery for transactional messages

## Common Template Issues

### Email Templates

- [ ] Missing unsubscribe links
- [ ] Poor mobile rendering
- [ ] Generic content not personalized
- [ ] Missing nonprofit-specific context
- [ ] Inconsistent branding

### UI Templates

- [ ] Theme color violations
- [ ] Missing loading states
- [ ] Poor error messaging
- [ ] Non-responsive design
- [ ] Accessibility issues

### Database Templates

- [ ] Inconsistent naming conventions
- [ ] Missing validation rules
- [ ] Poor performance optimization
- [ ] Inadequate error handling
- [ ] Missing audit trails

## Template Testing Checklist

- [ ] Mobile responsiveness verified
- [ ] Email deliverability tested
- [ ] Notification timing validated
- [ ] Error states handled gracefully
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
- [ ] Brand consistency maintained
- [ ] Nonprofit context appropriate

## Nonprofit-Specific Template Considerations

- **Grant deadline urgency**: Clear, time-sensitive messaging
- **Budget constraints**: Respectful of limited resources
- **Board communication**: Professional tone for leadership
- **Volunteer coordination**: Clear instructions for non-technical users
- **Compliance requirements**: Grant reporting and audit trails

## Template Maintenance

- **Version control**: Track template changes with rationale
- **A/B testing**: Optimize conversion rates
- **User feedback**: Incorporate nonprofit user insights
- **Performance monitoring**: Track template effectiveness
- **Compliance updates**: Stay current with grant requirements

## Usage

Apply this template review process to ensure all template systems maintain professional quality and serve our nonprofit users effectively while supporting our subscription business model.

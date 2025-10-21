# Dashboard Setup Guide

## Prerequisites

Before running the new dashboard, ensure you have the following installed:

- Node.js 20.0.0 or higher
- npm or pnpm package manager
- next-auth package (if not already installed)

## Installation

### 1. Install Missing Dependencies (if needed)

The dashboard uses `next-auth` for authentication. If not already installed:

```bash
npm install next-auth
# or
pnpm add next-auth
```

### 2. Install Project Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set Up Environment Variables

Ensure your `.env` or `.env.local` file contains:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="your-ga-id"
```

### 4. Run Database Migrations (if needed)

```bash
npx prisma migrate dev
```

### 5. Clear Next.js Cache

```bash
rm -rf .next
```

### 6. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The app should now be running at `http://localhost:3000`

## Accessing the Dashboard

1. Navigate to `http://localhost:3000`
2. Log in with your credentials
3. You'll be redirected to the new dashboard at `/dashboard`

Or directly access: `http://localhost:3000/dashboard`

## File Structure

The dashboard consists of these new files:

```
/app/
├── dashboard/
│   ├── page.tsx       # Main dashboard component
│   ├── layout.tsx     # Dashboard layout (session providers)
│   └── loading.tsx    # Loading skeleton

/src/app/
└── webinars/
    └── page.tsx       # Webinars listing page (new)

/docs/
├── DASHBOARD_GUIDE.md
├── DASHBOARD_IMPLEMENTATION.md
└── DASHBOARD_SETUP.md (this file)
```

## Configuration Updates

### Tailwind Config

The `tailwind.config.ts` has been updated to:

1. Include `/app` directory in content paths
2. Add custom width class `w-70` (280px) for sidebar

```typescript
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",  // Added
  "./components/**/*.{js,ts,jsx,tsx,mdx}",  // Added
  // ... existing paths
],
extend: {
  width: {
    '70': '280px',  // Custom sidebar width
  },
  // ... rest of config
}
```

## Troubleshooting

### Issue: "Unable to resolve path to module"

**Problem**: Import errors for `@/components/Providers` or similar

**Solution**: The dashboard layout uses relative imports. Ensure the path is:
```typescript
import { Providers } from "../../src/components/Providers"
```

### Issue: "next-auth not found"

**Problem**: next-auth is not installed

**Solution**: 
```bash
npm install next-auth
```

### Issue: Styles not loading

**Problem**: Tailwind not picking up new files

**Solution**: 
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server
3. Check Tailwind config includes `/app/**` path

### Issue: Session not working

**Problem**: NextAuth configuration issues

**Solution**:
1. Check `NEXTAUTH_URL` in environment variables
2. Verify `NEXTAUTH_SECRET` is set
3. Check database connection
4. Ensure Providers component is wrapping the app

### Issue: Organization data not loading

**Problem**: API endpoint issues

**Solution**:
1. Check `/api/organization` endpoint exists and works
2. Verify database has Organization table
3. Check user is linked to an organization in database
4. Open browser dev tools and check Network tab for errors

### Issue: Webinars page showing error

**Problem**: API endpoint not accessible

**Solution**:
1. Check `/api/admin/webinars` endpoint exists
2. Verify endpoint doesn't require special authentication
3. Update webinars page to use correct API endpoint if needed

## Testing the Dashboard

### Manual Testing Checklist

1. **Authentication Flow**
   - [ ] Visiting `/dashboard` when logged out redirects to login
   - [ ] After login, redirected to dashboard
   - [ ] Session persists on page refresh

2. **Navigation**
   - [ ] All sidebar links work correctly
   - [ ] Active state highlights current page
   - [ ] User profile section at bottom displays correctly

3. **Dashboard Content**
   - [ ] Welcome message shows user name
   - [ ] Organization name displays (if set)
   - [ ] Profile completion banner shows if profile incomplete
   - [ ] Quick actions links work

4. **Webinars Page**
   - [ ] Webinars listing loads
   - [ ] Upcoming/past sections separate correctly
   - [ ] Individual webinar links work
   - [ ] Empty state shows when no webinars

5. **Loading States**
   - [ ] Skeleton loader shows during data fetch
   - [ ] No layout shift when content loads

6. **Responsive Design**
   - [ ] Sidebar displays correctly
   - [ ] Content area adapts to screen size
   - [ ] Cards stack properly on mobile (future enhancement)

## Development Notes

### Making Changes

When modifying the dashboard:

1. **Dashboard Component** (`/app/dashboard/page.tsx`)
   - Edit navigation items in `navItems` array
   - Modify card sections in JSX
   - Update data fetching logic in `loadUserData()`

2. **Dashboard Layout** (`/app/dashboard/layout.tsx`)
   - Minimal layout for authentication
   - Wraps content with Providers

3. **Styling**
   - All styles use Tailwind CSS
   - Primary color: `emerald-500` (#10B981)
   - Modify classes directly in JSX

### Adding New Navigation Items

```typescript
{
  id: 'unique-id',
  label: 'Display Name',
  href: '/your-route',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {/* SVG path */}
    </svg>
  )
}
```

### Adding New Dashboard Cards

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h3 className="mb-4 text-lg font-semibold text-gray-900">Card Title</h3>
  {/* Card content */}
</div>
```

## Performance Tips

1. **Data Fetching**
   - Dashboard fetches organization data on mount
   - Consider using SWR or React Query for caching
   - Implement incremental static regeneration for static sections

2. **Images**
   - Add proper image optimization for webinar thumbnails
   - Use Next.js Image component

3. **Code Splitting**
   - Dashboard already uses Next.js automatic code splitting
   - Consider lazy loading heavy components

## Security Considerations

1. **Authentication**
   - Dashboard checks session on every page load
   - Redirects to login if unauthenticated
   - Server-side session validation recommended

2. **API Endpoints**
   - Ensure `/api/organization` validates user session
   - Don't expose sensitive data in client-side code
   - Use proper authorization checks

3. **Environment Variables**
   - Never commit `.env` files
   - Use different secrets for development/production
   - Rotate `NEXTAUTH_SECRET` regularly

## Next Steps

After successful setup:

1. **Customize Branding**
   - Update logo in sidebar
   - Adjust color scheme if needed
   - Modify welcome messages

2. **Add Features**
   - Implement real-time activity feed
   - Add webinar RSVP tracking
   - Create analytics widgets

3. **Optimize Performance**
   - Add caching for API responses
   - Implement pagination for large lists
   - Add loading states for all async operations

4. **Mobile Optimization**
   - Add hamburger menu for mobile
   - Make sidebar collapsible
   - Test on various screen sizes

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Dashboard Guide](./DASHBOARD_GUIDE.md)
- [Implementation Details](./DASHBOARD_IMPLEMENTATION.md)

## Support

For issues or questions:
1. Check this setup guide
2. Review troubleshooting section
3. Check browser console for errors
4. Review Next.js and NextAuth documentation

## Version Information

- **Next.js**: 15.3.3
- **React**: 19.1.0
- **Tailwind CSS**: 4.1.5
- **Node.js**: 20.0.0+ required

## License

See project LICENSE file.


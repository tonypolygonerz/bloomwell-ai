# Bloomwell AI Dashboard Guide

## Overview

The new Bloomwell AI dashboard (`/app/dashboard/`) features a clean, Beehiiv-inspired interface designed for nonprofit users to efficiently manage their activities and access key features.

## Features

### Layout Structure

- **Left Sidebar Navigation** (280px width)
  - Bloomwell AI branding with logo
  - Navigation menu with icons
  - User profile section at bottom
  
- **Main Content Area**
  - Flexible layout that adapts to content
  - Clean typography with proper hierarchy
  - Responsive grid system

### Navigation Items

1. **Dashboard** - Home view with overview
2. **AI Chat** - Access the AI assistant
3. **Grant Search** - Quick access to grant discovery
4. **Webinars** - Browse and RSVP to webinars
5. **My Profile** - Manage organization profile
6. **Notifications** - View notification center

### Dashboard Sections

#### Welcome Banner
- Personalized greeting with user name
- Organization name display
- Profile completion prompt (if incomplete)

#### Quick Actions Card
- Chat with AI Assistant
- Find Grants
- Analyze Documents
- Board Governance Help
- Funding Ideas

#### My Upcoming Events Card
- Shows webinar RSVPs
- Empty state with call-to-action
- Link to browse all webinars

#### Organization Profile Card
- Displays organization name and mission
- Quick access to profile setup
- Admin dashboard link

#### Recent Activity
- Timeline of user interactions
- Empty state when no activity

#### Webinar Resources
- Links to all webinars
- Notification center access

## Design System

### Colors
- **Primary Green**: `#10B981` (emerald-500)
- **Accent Green**: `#34D399` (emerald-400)
- **Background**: `#F9FAFB` (gray-50)
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6B7280` (gray-500)

### Typography
- **Font Family**: Inter (from Google Fonts)
- **Headings**: font-semibold to font-bold
- **Body**: font-medium
- **Labels**: text-sm font-medium

### Spacing
- **Sidebar**: px-3, py-4
- **Content**: px-8, py-6
- **Cards**: p-6
- **Grid gaps**: gap-6

### Interactive States

#### Navigation Items
- **Default**: text-gray-700, hover:bg-gray-100
- **Active**: bg-emerald-50, text-emerald-700, border-emerald-200
- **Icons**: Change color based on active state

#### Cards
- **Default**: border-gray-200, shadow-sm
- **Hover**: hover:bg-gray-50 (for clickable elements)

## Technical Implementation

### File Structure
```
/app/dashboard/
├── page.tsx       # Main dashboard component
├── layout.tsx     # Dashboard-specific layout
└── loading.tsx    # Loading state
```

### Dependencies
- `next-auth` for session management
- `@radix-ui` components for accessibility
- Tailwind CSS for styling

### Data Fetching
- Organization data from `/api/organization`
- Server-side session validation
- Client-side state management with React hooks

### Authentication
- Redirects to `/auth/login` if unauthenticated
- Uses `useSession()` hook from next-auth
- Shows loading state during authentication check

## Customization

### Adding New Navigation Items
Edit the `navItems` array in `page.tsx`:
```typescript
{
  id: 'unique-id',
  label: 'Display Name',
  href: '/route',
  icon: <svg>...</svg>
}
```

### Modifying Card Layout
The grid uses Tailwind's responsive classes:
- Mobile: `grid-cols-1`
- Desktop: `lg:grid-cols-3`

Adjust in the main grid section as needed.

### Changing Brand Colors
Update the emerald color classes:
- `emerald-500` → Your primary color
- `emerald-50` → Light variant for backgrounds
- `emerald-700` → Dark variant for text

## Accessibility

- Keyboard navigation support
- Focus states on all interactive elements
- Semantic HTML structure
- ARIA labels (via Radix UI components)
- High contrast text ratios

## Performance

- Server-side rendering for initial load
- Client-side navigation for instant transitions
- Optimized loading states
- Minimal JavaScript bundle

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Real-time activity feed
- [ ] Push notifications
- [ ] Dashboard customization
- [ ] Analytics widgets
- [ ] Dark mode support
- [ ] Mobile responsive sidebar (hamburger menu)
- [ ] Keyboard shortcuts
- [ ] Search functionality in sidebar

## Troubleshooting

### Styles not appearing
- Check Tailwind config includes `/app/**` in content paths
- Verify custom width class `w-70` is defined
- Clear Next.js cache: `rm -rf .next`

### Session issues
- Verify NextAuth configuration
- Check environment variables
- Ensure Providers component is wrapping the layout

### Layout conflicts
- Dashboard uses its own layout (no top navigation)
- Ensure `/app/dashboard/layout.tsx` exists
- Check route structure in Next.js

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [NextAuth.js](https://next-auth.js.org)


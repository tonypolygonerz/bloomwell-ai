# Dashboard Visual Guide

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD LAYOUT                                 │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                            │
│   SIDEBAR    │                    MAIN CONTENT                           │
│   (280px)    │                    (flex-1)                               │
│              │                                                            │
│              │                                                            │
│              │                                                            │
│              │                                                            │
│              │                                                            │
└──────────────┴──────────────────────────────────────────────────────────┘
```

## Sidebar Structure

```
┌──────────────────────┐
│  ⚡ Bloomwell AI      │  ← Logo + Brand (h-16)
├──────────────────────┤
│                      │
│  🏠 Dashboard        │  ← Navigation Items
│  💬 AI Chat          │    (Active: emerald bg)
│  🔍 Grant Search     │    (Hover: gray bg)
│  📅 Webinars         │
│  👤 My Profile       │
│  🔔 Notifications    │
│                      │
│  (spacer flex-1)     │
│                      │
├──────────────────────┤
│  👤 John Doe         │  ← User Profile
│     john@example.com │    (Bottom section)
└──────────────────────┘
```

## Main Content Structure

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Welcome back, John Doe! 👋                      (Header Section) │
│  Your Organization Name                                            │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ℹ️  Finish your settings                    (Completion Banner)  │
│     Complete your organization profile to unlock all features      │
│                                           Complete Profile →       │
│                                                                    │
├──────────────┬──────────────────┬───────────────────────────────────┤
│              │                  │                                   │
│ Quick        │  My Upcoming     │  Organization                    │
│ Actions      │  Events          │  Profile                         │
│              │                  │                                   │
│ 💬 Chat      │  🎥 (icon)       │  Name: Org Name                  │
│ 🔍 Grants    │  No upcoming     │  Mission: ...                    │
│ 📄 Docs      │  events          │                                   │
│ 👥 Board     │                  │  [Complete Profile]              │
│ 💡 Funding   │  [Browse]        │  [Admin Dashboard]               │
│              │                  │                                   │
├──────────────┴──────────────────┴───────────────────────────────────┤
│                                                                    │
│  Recent Activity                   │  Webinar Resources            │
│  ────────────────                  │  ─────────────────            │
│  No recent activity yet            │  🎓 Browse All Webinars       │
│                                    │  🔔 Notification Center        │
│                                    │                                │
└────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
```
Emerald-500 (#10B981)  ████████  Primary brand color
Emerald-600 (#059669)  ████████  Icon color (active)
Emerald-700 (#047857)  ████████  Text color (active)
Emerald-200 (#6EE7B7)  ████████  Border (active)
Emerald-50  (#ECFDF5)  ████████  Background (active)
```

### Neutral Colors
```
Gray-900 (#111827)     ████████  Primary text
Gray-700 (#374151)     ████████  Secondary text
Gray-600 (#4B5563)     ████████  Tertiary text
Gray-500 (#6B7280)     ████████  Muted text
Gray-200 (#E5E7EB)     ████████  Borders
Gray-100 (#F3F4F6)     ████████  Hover backgrounds
Gray-50  (#F9FAFB)     ████████  Sidebar background
White    (#FFFFFF)     ████████  Card backgrounds
```

### Accent Colors
```
Blue-600 (#2563EB)     ████████  Profile CTA button
Purple-600 (#9333EA)   ████████  Admin button
```

## Component Breakdown

### Navigation Item

**Default State:**
```
┌─────────────────────────┐
│  🏠  Dashboard          │  ← Gray text, no background
└─────────────────────────┘
```

**Hover State:**
```
┌─────────────────────────┐
│  🏠  Dashboard          │  ← Gray-100 background
└─────────────────────────┘
```

**Active State:**
```
┌─────────────────────────┐
│ │ 🏠  Dashboard       │ │  ← Emerald-50 bg, border
└─────────────────────────┘
   └─ emerald-200 border
```

### Card Component

```
┌─────────────────────────────────┐
│                                 │ ← shadow-sm
│  Card Title               (lg)  │ ← font-semibold
│  ─────────────                  │
│                                 │
│  Card content goes here...      │
│  • Item 1                       │
│  • Item 2                       │
│  • Item 3                       │
│                                 │
└─────────────────────────────────┘
```

**Styling:**
- Border: `border border-gray-200`
- Background: `bg-white`
- Shadow: `shadow-sm`
- Padding: `p-6`
- Rounded: `rounded-lg`

### Quick Action Button

```
┌─────────────────────────────────┐
│  💬  Chat with AI Assistant     │
└─────────────────────────────────┘
```

**Styling:**
- Border: `border border-gray-200`
- Hover: `hover:bg-gray-50`
- Padding: `p-3`
- Transition: `transition-colors`

### Profile Completion Banner

```
┌─────────────────────────────────────────────────┐
│ ℹ️  Finish your settings          Complete → │
│    Complete your organization profile...        │
└─────────────────────────────────────────────────┘
```

**Styling:**
- Background: `bg-blue-50`
- Border: `border border-blue-200`
- Text: `text-blue-700`, `text-blue-900`

## Typography Scale

```
3xl  (36px)  Welcome back, John Doe!       (Page title)
2xl  (24px)  Upcoming Webinars             (Section title)
lg   (18px)  Quick Actions                 (Card title)
base (16px)  Chat with AI Assistant        (Body text)
sm   (14px)  john@example.com              (Small text)
xs   (12px)  RSVP to see events here       (Help text)
```

**Font Weights:**
- `font-bold` (700): Page titles
- `font-semibold` (600): Card titles, navigation
- `font-medium` (500): Buttons, labels
- `font-normal` (400): Body text

## Spacing System

```
px-8  (32px)  Main content horizontal padding
py-6  (24px)  Main content vertical padding
p-6   (24px)  Card padding
px-3  (12px)  Navigation item horizontal padding
py-2  (8px)   Navigation item vertical padding
gap-6 (24px)  Grid gap between cards
space-y-4     Vertical spacing between elements
```

## Responsive Breakpoints

```
Mobile:    Default (single column)
Tablet:    md:grid-cols-2  (768px+)
Desktop:   lg:grid-cols-3  (1024px+)
```

## Icon Sizes

```
Sidebar Logo:     h-5 w-5  (20px)
Navigation Icons: h-5 w-5  (20px)
User Avatar:      h-8 w-8  (32px)
Emoji Icons:      text-xl  (20px)
Large Icons:      h-16 w-16 (64px) - Empty states
```

## States & Interactions

### Navigation Item States

1. **Default**
   - Text: `text-gray-700`
   - Background: `transparent`
   - Icon: `text-gray-500`

2. **Hover**
   - Background: `bg-gray-100`
   - Text: `text-gray-900`

3. **Active**
   - Background: `bg-emerald-50`
   - Text: `text-emerald-700`
   - Border: `border border-emerald-200`
   - Icon: `text-emerald-600`

### Card States

1. **Default**
   - Border: `border-gray-200`
   - Shadow: `shadow-sm`

2. **Hover** (for clickable cards)
   - Shadow: `shadow-md`
   - Background: `hover:bg-gray-50`

## Loading State

```
┌──────────────┬────────────────────────────────────┐
│              │                                    │
│  ▯▯▯▯▯▯▯     │  ▯▯▯▯▯▯▯▯▯▯▯                      │
│              │  ▯▯▯▯▯▯▯▯                          │
│  ▯▯▯▯        │                                    │
│  ▯▯▯▯        │  ▯▯▯▯▯▯  ▯▯▯▯▯▯  ▯▯▯▯▯▯          │
│  ▯▯▯▯        │  ▯▯▯▯▯▯  ▯▯▯▯▯▯  ▯▯▯▯▯▯          │
│  ▯▯▯▯        │  ▯▯▯▯▯▯  ▯▯▯▯▯▯  ▯▯▯▯▯▯          │
│  ▯▯▯▯        │                                    │
│              │                                    │
└──────────────┴────────────────────────────────────┘

▯ = animate-pulse bg-gray-200 rounded
```

## Webinars Page Layout

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Webinars & Training                                       │
│  Join our expert-led sessions...                           │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Upcoming Webinars                                         │
│  ──────────────                                            │
│                                                            │
│  ┌────────┐  ┌────────┐  ┌────────┐                      │
│  │ [img]  │  │ [img]  │  │ [img]  │                      │
│  │        │  │        │  │        │                      │
│  │ Title  │  │ Title  │  │ Title  │                      │
│  │ Desc   │  │ Desc   │  │ Desc   │                      │
│  │ 👤     │  │ 👤     │  │ 👤     │                      │
│  │ 📅     │  │ 📅     │  │ 📅     │                      │
│  └────────┘  └────────┘  └────────┘                      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Past Webinars                                             │
│  ─────────────                                             │
│                                                            │
│  (Similar card layout, opacity-75)                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Animation & Transitions

```css
/* Loading spinner */
@keyframes spin {
  animate-spin: rotate(360deg)
}

/* Fade in on load */
opacity-0 → opacity-100 (during loading)

/* Hover transitions */
transition-colors: 150ms ease
transition-shadow: 150ms ease

/* Active state */
transition: all 150ms ease
```

## Accessibility Features

### Keyboard Navigation
```
Tab       → Navigate through interactive elements
Enter     → Activate links/buttons
Escape    → Close modals (future)
```

### Focus States
```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-emerald-500
focus-visible:ring-offset-2
```

### Screen Reader Support
- Semantic HTML (nav, main, aside, section)
- Alt text for images
- ARIA labels where needed (via Radix UI)

## Browser Compatibility

```
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
```

## Print Styles (Future)

```css
@media print {
  .sidebar { display: none; }
  .no-print { display: none; }
  body { background: white; }
}
```

## Dark Mode (Future Enhancement)

```
Primary:      emerald-400  (lighter)
Background:   gray-900     (dark)
Cards:        gray-800     (dark)
Text:         gray-100     (light)
Borders:      gray-700     (subtle)
```

---

This visual guide provides a complete reference for the dashboard's design system, layout, and components. Use it to maintain consistency when adding new features or making modifications.


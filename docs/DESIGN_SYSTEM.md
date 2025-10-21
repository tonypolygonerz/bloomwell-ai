# Nonprofit AI Assistant - Design System Requirements

## Overview
This document defines the UI/UX standards for the Nonprofit AI Assistant platform to ensure consistency across all development sessions with CursorAI.

## Primary Design System: Radix Themes

### Theme Configuration
```jsx
<Theme accentColor="green">
```

### Color Palette
**Primary Green Scale** (Radix Themes):
- Green 1: `#fbfefc` (lightest)
- Green 9: `#30a46c` (primary accent)
- Green 12: `#193b2d` (darkest)

**Current Brand Color**: `#10B981` (to be harmonized with Radix green)

### Component Variants Required

#### Buttons
All buttons must include these variants:
- **Solid**: Green background, white text (`bg-green-600 text-white`)
- **Soft**: Light green background (`bg-green-100 text-green-900`)
- **Surface**: Very light background with borders (`bg-green-50 border-green-200`)
- **Outline**: Transparent with green borders (`border-green-600 text-green-600`)
- **Ghost**: Transparent with hover effects (`text-green-600 hover:bg-green-50`)

#### States
- Default, Disabled (50% opacity), Loading (spinner)
- Sizes: Small (h-7), Medium (h-9), Large (h-11)

#### Other Components
- **Badges**: Same variant system as buttons
- **Cards**: Surface, soft, classic variants
- **Text Fields**: Classic, surface, soft, ghost variants
- **Code blocks**: Syntax highlighting with green accent

### Technical Implementation

#### Current Stack Compatibility
- ✅ **shadcn/ui**: Apply Radix green theme to existing components
- ✅ **Tailwind CSS v3**: Use existing configuration
- ✅ **Next.js**: Compatible with current setup

#### CSS Classes Pattern
```css
/* Accent (Green) Variants */
.btn-solid-accent { @apply bg-green-600 text-white border-green-600 hover:bg-green-700; }
.btn-soft-accent { @apply bg-green-100 text-green-900 border-green-100 hover:bg-green-200; }
.btn-surface-accent { @apply bg-green-50 text-green-900 border-green-200 hover:bg-green-100; }

/* Gray Variants */
.btn-solid-gray { @apply bg-gray-900 text-white border-gray-900 hover:bg-gray-800; }
.btn-soft-gray { @apply bg-gray-100 text-gray-900 border-gray-100 hover:bg-gray-200; }
```

### Reference Implementation
**Claude Artifact**: "Radix Themes Playground Emulation"
- Complete component showcase
- All variants and states demonstrated
- Exact color implementations
- Responsive design patterns

## Development Guidelines for CursorAI

### When Creating New Components
1. **Always start with Radix Themes green variants**
2. **Include both accent (green) and gray color options**
3. **Implement all standard states** (default, disabled, loading)
4. **Follow accessibility guidelines** (proper contrast, focus states)
5. **Use consistent border radius** (configurable: none, small, medium, large, full)

### Component Checklist
Before completing any UI component:
- [ ] Green accent variants implemented
- [ ] Gray fallback variants included
- [ ] Disabled/loading states working
- [ ] Proper hover/focus effects
- [ ] Responsive design verified
- [ ] Accessibility standards met

### File Organization
```
src/
├── components/
│   ├── ui/           # shadcn/ui components (existing)
│   ├── radix/        # Custom Radix-themed components
│   └── design-system/ # Theme utilities and variants
├── styles/
│   ├── globals.css   # Radix color variables
│   └── components.css # Component-specific styles
```

### Integration Commands
When starting development sessions:

**For UI-focused work:**
```
STARTUP-DEV: Implementing Radix Themes green design system
- Apply green theme to [specific component]
- Follow Radix design patterns
- Maintain shadcn/ui compatibility
```

**For component creation:**
```
Create [ComponentName] following Radix Themes standards:
- Green accent variants (solid, soft, surface, outline, ghost)
- Gray fallback variants
- All interaction states
- Reference: Claude artifact "Radix Themes Playground"
```

## Quality Standards

### Visual Requirements
- **Consistent spacing**: Use Tailwind's spacing scale
- **Proper typography**: Clear hierarchy with appropriate weights
- **Color contrast**: Minimum WCAG AA compliance
- **Smooth transitions**: 200ms duration for hover/focus states

### Code Quality
- **TypeScript**: Properly typed component props
- **Reusable**: Components accept variant and size props
- **Documented**: Clear prop interfaces and examples
- **Tested**: Interactive states verified

## Approval Process
All UI components must be reviewed against this standard before merge:
1. Visual consistency with Radix Themes green
2. Complete variant implementation
3. Accessibility compliance
4. Mobile responsiveness
5. Integration with existing shadcn/ui setup

---

**Last Updated**: October 2025  
**Reference**: Claude Artifact - Radix Themes Playground Emulation  
**Status**: Active - All new development must follow these standards


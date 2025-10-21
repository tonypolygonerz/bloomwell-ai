# Quick Start: Performance & SEO

## 🚀 Getting Started

### 1. Environment Variables
Create or update `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://bloomwellai.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
```

### 2. Required Assets
Place these files in `/public`:

- `og-image.png` (1200x630px) - For social media sharing
- `logo.png` - Your logo for structured data
- `apple-touch-icon.png` (180x180px) - iOS icon
- `favicon.ico` - Browser favicon

### 3. Start Development
```bash
npm run dev
```

## 📊 View Analytics

### Check Tracking Events
Open browser console while navigating the site. You'll see:
- CTA clicks
- Scroll depth milestones
- Time on page
- Performance metrics

### Production Analytics
Set up Google Analytics:
1. Create GA4 property
2. Add tracking ID to `.env.local`
3. Events will automatically flow to GA

## 🧪 Test Performance

### Run Lighthouse Audit
```bash
# Build for production
npm run build
npm run start

# Then in Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
```

### Analyze Bundle Size
```bash
ANALYZE=true npm run build
```

### Test Core Web Vitals
1. Install [Web Vitals Extension](https://chrome.google.com/webstore/detail/web-vitals)
2. Visit your site
3. View metrics in extension

## 🎯 Track Conversions

### How CTA Tracking Works
Every "Get Started" and "Start Free Trial" button automatically tracks:
- Button location (Hero, Navigation, Features, etc.)
- Click timestamp
- User source

### View Conversion Data
- **Development**: Check browser console
- **Production**: View in Google Analytics → Events → Conversions

## 🐛 Error Monitoring

### View Client Errors
Errors are automatically:
1. Caught by Error Boundary
2. Logged to `/api/errors`
3. Tracked in analytics
4. Displayed user-friendly message

### Set Up Error Tracking (Recommended)
Integrate with Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## 📈 Monitor Performance

### Core Web Vitals
Access at runtime:
```javascript
// Available automatically via analytics.ts
// Check console for:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

### Page Speed
Test your site:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

## 🔍 SEO Validation

### Test Open Graph Tags
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

### Test Structured Data
- **Google**: https://search.google.com/test/rich-results
- **Schema.org**: https://validator.schema.org/

### Check Sitemap
Visit: `https://your-site.com/sitemap.xml`

### Check Robots.txt
Visit: `https://your-site.com/robots.txt`

## 🎨 Use Components

### Skeleton Loaders
```tsx
import { FeatureCardSkeleton } from '@/app/components/Skeleton'

function MyComponent() {
  const { data, loading } = useFetch()
  
  if (loading) return <FeatureCardSkeleton />
  return <div>{data}</div>
}
```

### Error Boundary
```tsx
import { ErrorBoundary } from '@/app/components/ErrorBoundary'

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Analytics Tracking
```tsx
import { trackCTAClick, trackConversion } from '@/app/lib/analytics'

<button onClick={() => {
  trackCTAClick('My Button', 'My Section')
  trackConversion('custom_event', { value: 100 })
}}>
  Click Me
</button>
```

## 📱 Mobile Testing

### Test Responsive Design
```bash
# Chrome DevTools Device Toolbar (Ctrl+Shift+M)
# Test on:
- iPhone 12/13/14
- iPad
- Galaxy S20
- Pixel 5
```

### Mobile Performance
Target metrics:
- First Contentful Paint: < 1.8s
- Speed Index: < 3.4s
- Time to Interactive: < 3.8s

## 🔐 Security Headers

All security headers are automatically applied via middleware:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (production)

## 📦 Bundle Optimization

### Check Bundle Size
```bash
ANALYZE=true npm run build
# Opens interactive bundle analyzer
```

### Optimization Tips
- Lazy load heavy components
- Use dynamic imports for routes
- Optimize images (WebP/AVIF)
- Remove unused dependencies

## 🎓 Best Practices

### Images
```tsx
import Image from 'next/image'

<Image
  src="/my-image.png"
  alt="Descriptive alt text"
  width={800}
  height={600}
  priority={false} // Only true for above-fold images
/>
```

### Fonts
Already optimized in layout! Uses:
- Google Fonts with display=swap
- Preconnect for faster loading
- Font subsetting

### Caching
Automatic via middleware:
- Static assets: 1 year cache
- API responses: Contextual
- Use `stale-while-revalidate` pattern

## 🆘 Troubleshooting

### Analytics Not Tracking
1. Check environment variables
2. Verify GA_ID is correct
3. Check browser console for errors
4. Disable ad blockers for testing

### Images Not Optimizing
1. Check next.config.ts settings
2. Verify image paths are correct
3. Use Next.js Image component
4. Check image file formats

### Low Performance Scores
1. Run Lighthouse in incognito mode
2. Test on production build, not dev
3. Check network throttling is off
4. Clear browser cache

### SEO Issues
1. Verify all meta tags are present
2. Test with social media debuggers
3. Check sitemap is accessible
4. Validate structured data

## 📚 Documentation

Full documentation available in:
- `/docs/PERFORMANCE_SEO.md` - Comprehensive guide
- `/docs/PHASE_9_IMPLEMENTATION_SUMMARY.md` - Implementation details

## 🎉 Success Checklist

- [ ] Environment variables configured
- [ ] Assets added to /public
- [ ] Google Analytics set up
- [ ] Lighthouse scores >90
- [ ] Open Graph tags validated
- [ ] Error tracking configured
- [ ] Mobile testing completed
- [ ] Core Web Vitals in "Good" range

---

## Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Analyze bundle
ANALYZE=true npm run build

# Lint
npm run lint

# Format
npm run format
```

## Support

For issues or questions:
1. Check `/docs/PERFORMANCE_SEO.md`
2. Review browser console
3. Test with Lighthouse
4. Validate with online tools

---

**All systems optimized and ready for production! 🚀**


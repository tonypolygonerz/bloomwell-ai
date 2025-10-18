# Progressive Registration Testing Guide

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```

### 2. Navigate to Registration
Open: **http://localhost:3000/auth/register**

---

## ✅ Testing Checklist

### Visual Inspection

#### Desktop View (≥1024px)
- [ ] Split-screen layout displays correctly
- [ ] Left panel shows:
  - [ ] Bloomwell AI logo
  - [ ] "Start your 14-day free trial" headline
  - [ ] 4 benefits with icons
  - [ ] Social proof testimonial card
  - [ ] Trust badges at bottom
- [ ] Right panel shows:
  - [ ] "Create your account" heading
  - [ ] White form card with shadow
  - [ ] Step indicator (Step 1 of 3)
  - [ ] 3 initial form fields
- [ ] Green theme consistent throughout

#### Mobile View (<768px)
- [ ] Layout stacks vertically
- [ ] Mobile logo appears at top
- [ ] Value proposition hidden
- [ ] Form takes full width
- [ ] Benefits list shows below form
- [ ] Everything readable and touchable

---

## 🧪 Functional Tests

### Step 1: Initial Fields

#### Phone Number Field
1. Click phone field
2. Type: 5551234567
3. **Expected:** Auto-formats to (555) 123-4567
4. Clear field and type: 123
5. Click Continue
6. **Expected:** Validation error "Please enter a valid phone number"

#### Country Code Selector
1. Click country dropdown
2. **Expected:** Shows 🇺🇸 US, 🇬🇧 UK, 🇮🇳 IN, 🇦🇺 AU, 🇰🇪 KE
3. Select different country
4. **Expected:** Country code updates (+1, +44, +91, +61, +254)

#### Organization Type
1. Click organization type dropdown
2. **Expected:** Shows 6 options
   - US registered 501c3 nonprofit (default)
   - Church or religious organization
   - Social enterprise / B-Corp
   - Private foundation
   - Government agency
   - Other
3. Select "Church or religious organization"
4. **Expected:** Updates selection

#### Organization Search
1. Type in search field: "red"
2. **Expected:** 
   - Loading spinner appears in input
   - After 300ms, dropdown appears with results
3. Type: "red cross"
4. **Expected:** Shows up to 5 results
5. **Expected result format:**
   ```
   American Red Cross
   EIN: 53-0196605 • Washington, DC
   ```
6. Click a result
7. **Expected:**
   - Dropdown closes
   - Selected org appears in green confirmation box
   - Shows: Name, EIN, City/State
   - "Change" button visible
   - "Continue" button appears

#### Manual Entry
1. Type: "zzznonexistent"
2. **Expected:** "No organizations found"
3. Click "Enter organization details manually"
4. **Expected:** Manual entry form expands
5. Fill in:
   - Name: Test Nonprofit
   - EIN: 12-3456789
   - City: San Francisco
   - State: CA
6. Click "Continue" in manual form
7. **Expected:** Organization saved, proceed enabled

#### Step 1 Continue Button
1. Complete all Step 1 fields
2. Select an organization
3. **Expected:** "Continue" button appears
4. Click "Continue"
5. **Expected:** 
   - Step indicator updates to "Step 2 of 3"
   - Progress bar: 2 bars green, 1 gray
   - New fields animate in from top

---

### Step 2: Organization Details

#### Selected Organization Display
- [ ] Organization name visible in green box
- [ ] EIN and location shown
- [ ] Green checkmark icon present
- [ ] "Change" button available

#### 501(c)(3) Status
1. Click dropdown
2. **Expected:** Shows 4 options
   - Yes, we have 501(c)(3) status
   - No, but we are a tax-exempt organization
   - Application pending
   - Not applicable
3. Select "Yes, we have 501(c)(3) status"
4. Leave empty and try to continue
5. **Expected:** Error "Please confirm 501(c)(3) status"

#### Operating Revenue
1. Click dropdown
2. **Expected:** Shows 8 revenue tiers
   - Below $90K
   - $90K-$200K
   - $200K-$500K
   - $500K-$750K
   - $750K-$1M
   - $1M-$5M
   - $5M-$10M
   - >$10M
3. Select "$500K-$750K"
4. Leave empty and try to continue
5. **Expected:** Error "Please select your operating revenue"

#### Step 2 Continue Button
1. Complete both fields
2. **Expected:** "Continue" button appears
3. Click "Continue"
4. **Expected:** 
   - Step indicator updates to "Step 3 of 3"
   - Progress bar: All 3 bars green
   - Final fields animate in

---

### Step 3: Final Details

#### Grant History
1. Click dropdown
2. **Expected:** Shows 5 options
   - No grants in last 12 months
   - 1-3 grants in last 12 months
   - 4-10 grants in last 12 months
   - 10+ grants in last 12 months
   - Never applied for grants
3. Select "1-3 grants in last 12 months"

#### Your Name
1. Type: John Doe
2. Clear and try to submit
3. **Expected:** Error "Your name is required"

#### Email Address
1. Type: invalid-email
2. Try to submit
3. **Expected:** Error "Please enter a valid email"
4. Type: test@example.com
5. **Expected:** Error clears

#### Password
1. Type: 123
2. Try to submit
3. **Expected:** Error "Password must be at least 8 characters"
4. Type: password123
5. **Expected:** Error clears

#### Submit Button
1. Complete all fields
2. **Expected:** "Start my free trial" button enabled
3. Click submit
4. **Expected:**
   - Button shows spinner
   - Text changes to "Creating account..."
   - Button disabled during submission

---

## 🔄 Navigation Tests

### Back Button Navigation
1. Complete Step 1, go to Step 2
2. Click back arrow (←)
3. **Expected:** Returns to Step 1, data preserved
4. Complete Step 1 again, go to Step 2
5. Complete Step 2, go to Step 3
6. Click back arrow
7. **Expected:** Returns to Step 2, data preserved

### Change Organization
1. Complete Step 1, go to Step 2
2. Click "Change" button on organization
3. **Expected:** Returns to Step 1, search field cleared
4. Can search for different organization

---

## 🌐 API Integration Tests

### Organization Search API
**Test endpoint:** `/api/organizations/search?q=red+cross`

```bash
curl "http://localhost:3000/api/organizations/search?q=red+cross"
```

**Expected response:**
```json
{
  "organizations": [
    {
      "name": "American Red Cross",
      "ein": "53-0196605",
      "city": "Washington",
      "state": "DC"
    },
    // ... more results
  ],
  "count": 5
}
```

**Error cases:**
- Query < 3 chars: 400 error
- ProPublica API down: 500 error
- Network error: Handled gracefully

### Registration API
**Test endpoint:** `/api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+15551234567",
    "organization": {
      "name": "Test Nonprofit",
      "ein": "12-3456789",
      "city": "San Francisco",
      "state": "CA",
      "organizationType": "nonprofit",
      "has501c3Status": true,
      "operatingRevenue": "$500K-$750K",
      "grantHistory": "In the last 12 months, my organization received 1-3 grants"
    }
  }'
```

**Expected response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "organizationId": "uuid"
  }
}
```

**Error cases:**
- Duplicate email: 400 "User already exists"
- Missing fields: 400 with specific error
- Database error: 500 "An error occurred"

---

## 🔍 Database Verification

### After Successful Registration

```sql
-- Check user was created
SELECT id, name, email, organizationId, subscriptionStatus, trialEndDate
FROM User
WHERE email = 'john@example.com';

-- Check organization was created
SELECT id, name, ein, state, organizationType, budget, isVerified
FROM Organization
WHERE id = (SELECT organizationId FROM User WHERE email = 'john@example.com');

-- Verify trial dates
SELECT 
  name, 
  trialStartDate,
  trialEndDate,
  JULIANDAY(trialEndDate) - JULIANDAY(trialStartDate) as trial_days
FROM User
WHERE email = 'john@example.com';
-- Expected: trial_days = 14
```

---

## 🎨 Visual Regression Tests

### Colors
- [ ] Emerald green (#10B981) used consistently
- [ ] Left panel gradient: emerald-600 to emerald-800
- [ ] Buttons: emerald-600, hover: emerald-700
- [ ] Success states: emerald-50 background
- [ ] Error states: red-300 borders

### Spacing
- [ ] Form card padding: 2rem (32px)
- [ ] Field spacing: 1.25rem (20px)
- [ ] Button height: 3rem (48px)
- [ ] Input height: 2.5rem (40px)

### Typography
- [ ] Page title: 3xl (30px), bold
- [ ] Field labels: sm (14px), semibold
- [ ] Help text: xs (12px), gray-500
- [ ] Benefit titles: lg (18px), semibold

### Animations
- [ ] Step transition: 300ms fade + slide
- [ ] Dropdown appear: smooth
- [ ] Loading spinners: smooth rotation
- [ ] Button hover: color transition

---

## ♿ Accessibility Tests

### Keyboard Navigation
1. Tab through entire form
2. **Expected:** Focus visible on all interactive elements
3. Press Enter on Continue buttons
4. **Expected:** Progresses to next step
5. Press Tab in dropdowns
6. **Expected:** Can navigate options

### Screen Reader
1. Use VoiceOver (Mac) or NVDA (Windows)
2. Navigate through form
3. **Expected:** 
   - Labels announced for all fields
   - Required fields indicated
   - Error messages announced
   - Step progress announced

### ARIA Attributes
Inspect HTML:
- [ ] Form has role="form"
- [ ] Required fields have aria-required="true"
- [ ] Error messages have aria-invalid="true"
- [ ] Loading states have aria-busy="true"

---

## 🐛 Edge Cases

### Network Issues
1. Disconnect internet
2. Try organization search
3. **Expected:** Error message, graceful fallback
4. Try form submission
5. **Expected:** Error message, data preserved

### Slow API
1. Throttle network to Slow 3G
2. Search for organization
3. **Expected:** Loading spinner visible
4. Search completes after delay
5. **Expected:** Results appear

### Browser Back Button
1. Complete Step 2
2. Click browser back button
3. **Expected:** Returns to Step 1 OR shows warning

### Multiple Tabs
1. Open registration in 2 tabs
2. Submit in tab 1
3. Try to submit in tab 2 with same email
4. **Expected:** "User already exists" error

### XSS Prevention
1. Enter `<script>alert('xss')</script>` in name field
2. Submit form
3. **Expected:** Sanitized, no script execution

---

## 📊 Analytics Events to Track

### Page Load
- `registration_page_viewed`
- Device type, referrer

### Step Completion
- `registration_step_1_completed`
- `registration_step_2_completed`
- `registration_step_3_started`

### Organization Search
- `organization_searched` (query length)
- `organization_selected` (ProPublica vs manual)
- `manual_entry_opened`

### Form Abandonment
- `registration_abandoned` (which step)
- Time on page before abandonment

### Success
- `registration_completed`
- Total time, number of attempts

---

## 🎯 Success Metrics

### Performance
- [ ] Page load < 2 seconds
- [ ] Organization search response < 500ms
- [ ] Form submission < 1 second
- [ ] No console errors
- [ ] Lighthouse score > 90

### Completion Rate
- [ ] Step 1 → Step 2: Target 80%
- [ ] Step 2 → Step 3: Target 90%
- [ ] Step 3 → Submit: Target 85%
- [ ] Overall: Target 60%+ (vs ~25% baseline)

### User Satisfaction
- [ ] Form feels intuitive
- [ ] Organization search helpful
- [ ] No confusion about steps
- [ ] Clear error messages
- [ ] Feels professional

---

## 🆘 Common Issues & Fixes

### Issue: "Organization not found"
**Fix:** Use manual entry or search different terms

### Issue: Phone won't format
**Fix:** Type only numbers, formatting is automatic

### Issue: Continue button not appearing
**Fix:** Ensure organization is selected (green box visible)

### Issue: Form submission fails
**Fix:** Check console for errors, verify all required fields

### Issue: ProPublica API timeout
**Fix:** Retry search or use manual entry

---

## 📞 Support Resources

### For Developers
- **Logs:** Check browser console
- **Network:** Check Network tab for API calls
- **State:** Add `console.log(formData)` in component

### For QA Team
- **Test users:** Create with `+test1@example.com` pattern
- **Clean up:** Delete test users from database
- **Reset:** Clear localStorage, cookies

### For Product Team
- **Analytics:** Check Mixpanel/GA4 dashboard
- **Heatmaps:** Use Hotjar to see where users click
- **Session replays:** Review user journeys

---

**Last Updated:** October 12, 2025  
**Version:** 1.0.0  
**Status:** Ready for User Acceptance Testing



# 🧪 Pricing Page Toggle Testing Guide

**Test Date:** October 9, 2025  
**Tester:** [YOUR NAME]  
**Environment:** http://localhost:3000/pricing  
**Status:** ⏳ PENDING MANUAL TESTING

---

## 📋 Pre-Test Code Analysis

### ✅ Code Implementation Review

#### 1. **PricingToggle Component** (`/src/components/PricingToggle.tsx`)

**Key Findings:**

- ✅ Uses React `useState` for toggle state
- ✅ Dispatches `pricingToggle` custom event on toggle
- ✅ "Save 16%" badge appears when `isAnnual === true`
- ✅ Proper ARIA labels for accessibility
- ✅ Smooth CSS transitions implemented

**Event Communication:**

```javascript
window.dispatchEvent(
  new CustomEvent('pricingToggle', {
    detail: { isAnnual: newValue },
  })
);
```

#### 2. **PricingCard Component** (`/src/components/PricingCard.tsx`)

**Key Findings:**

- ✅ Listens for `pricingToggle` event via `useEffect`
- ✅ Reads Stripe Price IDs from environment variables
- ✅ Console logs for debugging (lines 36-37)
- ⚠️ **PRICING MISMATCH DETECTED:**
  - Code shows: `$24.99/month`, `$20.99/month annual`
  - Should be: `$29.99/month`, `$209/year ($17.42/month)`

**Current Pricing Constants:**

```javascript
const monthlyPrice = 24.99; // ❌ Should be 29.99
const annualPrice = 20.99; // ❌ Should be 17.42
const annualTotal = 251.88; // ❌ Should be 209.00
```

**Console Logging:**

```javascript
console.log('PricingCard - Monthly Price ID:', monthlyPriceId);
console.log('PricingCard - Annual Price ID:', annualPriceId);
```

#### 3. **Expected Stripe Price IDs** (from `.env.local`)

```
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_1SAas1GpZiQKTBAtcgtB71u4
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_1SAatSGpZiQKTBAtmOVcBQZG
```

---

## 🧪 Manual Testing Procedure

### Pre-requisites:

- ✅ Development server running: http://localhost:3000
- ✅ Browser with DevTools (Chrome/Firefox/Safari)

---

### TEST 1: Initial Page Load

**Steps:**

1. Open browser to: http://localhost:3000/pricing
2. Open DevTools Console (Press F12 → Console tab)
3. Refresh page if already open

**Expected Results:**

- [ ] Page loads without errors
- [ ] Pricing card displays prominently
- [ ] Toggle switch visible with "Monthly" and "Annual" labels
- [ ] Initial state shows "Monthly" in green text
- [ ] Price displays: **$24.99/month** (current code value)
- [ ] "Start 14-Day Free Trial" button visible

**Console Output Expected:**

```
PricingCard - Monthly Price ID: price_1SAas1GpZiQKTBAtcgtB71u4
PricingCard - Annual Price ID: price_1SAatSGpZiQKTBAtmOVcBQZG
```

**Actual Results:**

```
[FILL IN AFTER TESTING]

Console Output:


Screenshot: [ATTACH OR DESCRIBE]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 2: Console Log Verification

**Steps:**

1. In DevTools Console, look for the two log messages
2. Copy the exact price IDs shown

**Expected Results:**

- [ ] Monthly Price ID matches: `price_1SAas1GpZiQKTBAtcgtB71u4`
- [ ] Annual Price ID matches: `price_1SAatSGpZiQKTBAtmOVcBQZG`
- [ ] Both IDs are defined (not `undefined`)

**Actual Results:**

```
Monthly Price ID: [FILL IN]
Annual Price ID: [FILL IN]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 3: Verify Initial Monthly Display

**Steps:**

1. Ensure toggle is in "Monthly" position (left side)
2. Check pricing display

**Expected Results:**

- [ ] Price shows: **$24.99**/month
- [ ] "Monthly" text is green
- [ ] "Annual" text is gray
- [ ] NO "Save 16%" badge visible
- [ ] Toggle switch is on the LEFT side

**Actual Results:**

```
Price Displayed: $[FILL IN]/month
Monthly Color: [FILL IN]
Annual Color: [FILL IN]
Badge Visible: [YES/NO]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 4: Toggle to Annual Plan

**Steps:**

1. Click the toggle switch (or click on "Annual" text if clickable)
2. Observe the animation
3. Wait 1 second for state update

**Expected Results:**

- [ ] Toggle switch slides smoothly to the RIGHT
- [ ] "Annual" text turns green
- [ ] "Monthly" text turns gray
- [ ] "Save 16%" badge appears with fade-in animation
- [ ] Price changes to: **$20.99**/month
- [ ] Small text appears: "billed annually at $251.88"

**Actual Results:**

```
Toggle Animation: [SMOOTH/JERKY/NONE]
Price Displayed: $[FILL IN]/month
Annual Billing Text: [FILL IN]
Badge Text: [FILL IN]
Badge Animation: [SMOOTH/NONE]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 5: Verify Annual Plan Details

**Steps:**

1. With toggle on "Annual", inspect the pricing card details

**Expected Results:**

- [ ] Main price: **$20.99**/month
- [ ] Subtext: "billed annually at $251.88"
- [ ] Badge: "Save 16%"
- [ ] Button still says "Start 14-Day Free Trial" (if not logged in)
- [ ] All 4 feature checkmarks visible

**Actual Results:**

```
Main Price: $[FILL IN]/month
Annual Total: $[FILL IN]
Savings Badge: [FILL IN]
Button Text: [FILL IN]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 6: Calculate Savings Percentage

**Steps:**

1. Manually calculate the savings percentage
2. Compare with displayed "Save 16%"

**Current Code Math:**

```
Monthly: $24.99/month × 12 = $299.88/year
Annual: $251.88/year
Savings: $299.88 - $251.88 = $48.00
Percentage: ($48.00 / $299.88) × 100 = 16.01%
```

**Expected Results:**

- [ ] "Save 16%" is mathematically correct ✅

**Actual Results:**

```
[VERIFY CALCULATION]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 7: Toggle Back to Monthly

**Steps:**

1. Click toggle switch to return to "Monthly"
2. Observe state changes

**Expected Results:**

- [ ] Toggle switch slides smoothly to the LEFT
- [ ] "Monthly" text turns green
- [ ] "Annual" text turns gray
- [ ] "Save 16%" badge disappears
- [ ] Price returns to: **$24.99**/month
- [ ] "billed annually" text disappears

**Actual Results:**

```
Toggle Animation: [SMOOTH/JERKY/NONE]
Price Displayed: $[FILL IN]/month
Badge Disappeared: [YES/NO]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 8: Multiple Toggle Cycles

**Steps:**

1. Toggle Monthly → Annual → Monthly → Annual (4 clicks)
2. Observe for any bugs or state issues

**Expected Results:**

- [ ] Toggle responds to every click
- [ ] No delay or lag
- [ ] State always matches toggle position
- [ ] No console errors
- [ ] Animations remain smooth

**Actual Results:**

```
Number of Successful Toggles: [FILL IN]
Any Errors: [YES/NO - describe]
Performance: [SMOOTH/LAGGY]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 9: CTA Button Inspection (Not Logged In)

**Steps:**

1. Ensure you're NOT logged in (incognito/private browsing recommended)
2. Toggle between Monthly and Annual
3. Observe button behavior

**Expected Results:**

- [ ] Button always says "Start 14-Day Free Trial" (both plans)
- [ ] Button links to `/auth/register`
- [ ] Subtext says "No credit card required"
- [ ] Button is green (#10B981 or similar)

**Actual Results:**

```
Button Text (Monthly): [FILL IN]
Button Text (Annual): [FILL IN]
Button Link: [FILL IN]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 10: CTA Button Inspection (Logged In)

**Steps:**

1. Log in to the application
2. Navigate back to `/pricing`
3. Toggle between Monthly and Annual
4. Observe button behavior

**Expected Results:**

- [ ] Button shows "Upgrade to Monthly Plan" (when Monthly selected)
- [ ] Button shows "Upgrade to Annual Plan" (when Annual selected)
- [ ] Subtext says "Secure checkout with Stripe"
- [ ] Button uses UpgradeButton component

**Actual Results:**

```
Button Text (Monthly): [FILL IN]
Button Text (Annual): [FILL IN]
Subtext: [FILL IN]
```

**Status:** [ ] PASS [ ] FAIL

---

### TEST 11: Click Upgrade Button (Logged In Only)

⚠️ **WARNING:** This will create a real Stripe checkout session

**Steps:**

1. While logged in, click "Upgrade to Monthly Plan"
2. Observe browser behavior and console

**Expected Results:**

- [ ] Console shows: "Creating Stripe checkout session..."
- [ ] Redirects to Stripe Checkout page
- [ ] Stripe page shows correct price: $24.99/month
- [ ] Stripe page shows product name: "Bloomwell AI Professional"

**Actual Results:**

```
Redirect Occurred: [YES/NO]
Stripe Price Shown: $[FILL IN]
Any Errors: [DESCRIBE]
```

**Status:** [ ] PASS [ ] FAIL [ ] SKIPPED

---

### TEST 12: Responsive Design Check

**Steps:**

1. Use DevTools Device Emulation (Ctrl+Shift+M / Cmd+Shift+M)
2. Test these viewport sizes:
   - Mobile: 375px wide (iPhone SE)
   - Tablet: 768px wide (iPad)
   - Desktop: 1920px wide

**Expected Results:**

- [ ] Toggle remains usable at all sizes
- [ ] Text doesn't overlap
- [ ] Pricing card remains centered
- [ ] "Save 16%" badge fits properly

**Actual Results:**

```
Mobile (375px): [PASS/FAIL - describe issues]
Tablet (768px): [PASS/FAIL - describe issues]
Desktop (1920px): [PASS/FAIL - describe issues]
```

**Status:** [ ] PASS [ ] FAIL

---

## 🐛 Known Issues & Bugs Found

### Issue #1: [Title]

**Severity:** [CRITICAL/HIGH/MEDIUM/LOW]  
**Description:**

```
[Describe what you found]
```

**Steps to Reproduce:**

1.
2.
3.

**Expected:** [What should happen]  
**Actual:** [What actually happened]

**Screenshot/Evidence:**

```
[Paste console errors or describe visual issue]
```

---

### Issue #2: Pricing Values Don't Match Business Requirements

**Severity:** HIGH (Revenue Impact)  
**Description:**
Current code displays incorrect pricing:

- Shows: $24.99/month, $251.88/year
- Should be: $29.99/month, $209/year

**Impact:**

- $5/month revenue loss per subscriber
- $42.88/year overcharge on annual plan
- Business logic mismatch

**Files to Fix:**

- `/src/components/PricingCard.tsx` (lines 27-29)

**Recommended Fix:**

```javascript
const monthlyPrice = 29.99; // Changed from 24.99
const annualPrice = 17.42; // Changed from 20.99
const annualTotal = 209.0; // Changed from 251.88
```

**New Savings Calculation:**

```
Monthly: $29.99 × 12 = $359.88/year
Annual: $209.00/year
Savings: $150.88
Percentage: 42% (not 16%)
```

**Badge Should Say:** "Save 42%" (not "Save 16%")

---

## 📊 Test Summary

| Test # | Test Name                | Status | Notes                              |
| ------ | ------------------------ | ------ | ---------------------------------- |
| 1      | Initial Page Load        | [ ]    |                                    |
| 2      | Console Log Verification | [ ]    |                                    |
| 3      | Initial Monthly Display  | [ ]    |                                    |
| 4      | Toggle to Annual         | [ ]    |                                    |
| 5      | Annual Plan Details      | [ ]    |                                    |
| 6      | Savings Calculation      | [ ]    | Math checks out for current values |
| 7      | Toggle Back to Monthly   | [ ]    |                                    |
| 8      | Multiple Toggle Cycles   | [ ]    |                                    |
| 9      | CTA Button (Logged Out)  | [ ]    |                                    |
| 10     | CTA Button (Logged In)   | [ ]    |                                    |
| 11     | Upgrade Button Click     | [ ]    |                                    |
| 12     | Responsive Design        | [ ]    |                                    |

**Tests Passed:** [X] / 12  
**Tests Failed:** [X] / 12  
**Tests Skipped:** [X] / 12

---

## 🎯 Final Verdict

### Current Implementation: [WORKING / PARTIALLY WORKING / BROKEN]

**Functionality Grade:** [A/B/C/D/F]  
**Code Quality Grade:** [A/B/C/D/F]

### Critical Issues:

- [ ] No critical bugs preventing use
- [x] **PRICING VALUES INCORRECT** - Immediate fix required before production

### Recommendations:

#### Immediate (Before Production):

1. ✅ Fix pricing values in PricingCard.tsx
2. ✅ Update "Save 16%" to "Save 42%"
3. ✅ Verify Stripe price IDs match new pricing
4. ✅ Test checkout flow with corrected prices

#### Nice to Have:

1. Add loading state during toggle animation
2. Add keyboard navigation (Space/Enter to toggle)
3. Add visual feedback on hover
4. Consider A/B testing the savings messaging

---

## 📸 Screenshots & Evidence

### Screenshot 1: Initial Load (Monthly)

```
[ATTACH SCREENSHOT OR DESCRIBE]
```

### Screenshot 2: Annual Plan Selected

```
[ATTACH SCREENSHOT OR DESCRIBE]
```

### Screenshot 3: Console Output

```
[PASTE CONSOLE LOGS]
```

### Screenshot 4: Mobile View

```
[ATTACH SCREENSHOT OR DESCRIBE]
```

---

## 👤 Tester Sign-off

**Tested By:** [YOUR NAME]  
**Date:** [DATE]  
**Time Spent:** [X] minutes  
**Environment:** http://localhost:3000/pricing  
**Browser:** [Chrome/Firefox/Safari] [VERSION]

**Overall Assessment:**

```
[YOUR SUMMARY OF FINDINGS]
```

**Approved for Production:** [ ] YES [ ] NO (explain below)

**Reason:**

```
[If NO, explain what needs to be fixed first]
```

---

## 🔧 Developer Notes

**Code Review Completed By:** AI Assistant  
**Date:** October 9, 2025

**Code Quality Assessment:**

- ✅ TypeScript properly used
- ✅ React hooks correctly implemented
- ✅ Custom event pattern works well
- ✅ Accessibility ARIA labels present
- ✅ CSS transitions smooth
- ⚠️ Pricing values hardcoded (should match business requirements)
- ⚠️ No error boundaries for Stripe failures

**Security Check:**

- ✅ Stripe keys properly stored in .env.local
- ✅ NEXT*PUBLIC* prefix used correctly for client-side
- ✅ No sensitive data exposed in client code

---

**Report Complete - Ready for Manual Testing** ✅


# Google OAuth Branding Fix - Bloomwell AI

## 🎯 **Problem**

Google OAuth consent screen shows **"AI nonprofit chat product 2025"** instead of **"Bloomwell AI"**

## 📍 **Root Cause**

The application name is configured in **Google Cloud Console**, not in your code. This setting controls what users see on the OAuth consent screen.

---

## ✅ **SOLUTION: Update Google Cloud Console**

### Step 1: Access Google Cloud Console

1. Go to: **https://console.cloud.google.com**
2. Sign in with your Google account (the one that created the OAuth app)
3. Select your project from the dropdown (top left)

### Step 2: Navigate to OAuth Consent Screen

1. In the left sidebar, click **"APIs & Services"**
2. Click **"OAuth consent screen"**
3. You should see your current configuration

### Step 3: Update Application Name

1. Click **"Edit App"** button
2. Find the **"App name"** field
3. Change from: `AI nonprofit chat product 2025`
4. Change to: `Bloomwell AI`

### Step 4: Update Other Branding (Recommended)

While you're there, also update:

**Application home page**

- Current: (check what's there)
- Update to: `https://bloomwell-ai.com` (once deployed)
- Or for now: `http://localhost:3000`

**Application privacy policy link**

- Add: `https://bloomwell-ai.com/privacy` (create this page later)

**Application terms of service link**

- Add: `https://bloomwell-ai.com/terms` (create this page later)

**Application logo** (Optional but recommended)

- Upload a 120x120px logo with Bloomwell AI branding
- Formats: PNG or JPG
- Must be square

**Support email**

- Use your business email: `support@bloomwell-ai.com` or `tony@polygonerz.com`

### Step 5: Save Changes

1. Scroll to the bottom
2. Click **"Save and Continue"**
3. Wait for confirmation message

### Step 6: Review Scopes (Verify these are correct)

Navigate to **"Scopes"** tab and verify you have:

- `userinfo.email` - To read user email
- `userinfo.profile` - To read user name and profile picture
- `openid` - For OpenID Connect

These should already be configured, but double-check.

---

## 🧪 **TESTING THE FIX**

### Test 1: New User Registration

1. Open: **http://localhost:3000/auth/register**
2. Click **"Continue with Google"** button
3. **Expected Result**: Google consent screen should show:
   ```
   Sign in to continue to Bloomwell AI
   ```

### Test 2: Existing User Login

1. Open: **http://localhost:3000/auth/login**
2. Click **"Sign in with Google"** button
3. **Expected Result**: Should redirect to dashboard (if already authorized) or show updated consent screen

### Test 3: Full OAuth Flow

1. Use an incognito/private window
2. Go to: **http://localhost:3000/auth/register**
3. Click Google sign-in
4. Complete OAuth flow
5. Verify:
   - ✅ Consent screen shows "Bloomwell AI"
   - ✅ User is created in database
   - ✅ User is redirected to dashboard or onboarding

---

## ⚠️ **IMPORTANT NOTES**

### Propagation Time

- **Changes may take 5-10 minutes** to propagate
- Clear your browser cache if you don't see changes immediately
- Try a different browser or incognito mode

### Verification Status

If your app is still in **"Testing"** mode:

- Only test users can sign in
- You must add user emails to the **"Test users"** list
- To add test users: OAuth consent screen → Test users → Add users

### Production Considerations

When deploying to production:

1. Change app status from "Testing" to "In Production"
2. Update redirect URIs to production URLs
3. Complete Google's verification process if required
4. Add production domain to authorized domains

---

## 🔧 **CODE VERIFICATION**

Your Next.js code is already correctly configured. No code changes needed!

### Current OAuth Configuration (Already Correct)

```typescript
// src/app/api/auth/[...nextauth]/route.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});
```

### Environment Variables Required

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## 📋 **CHECKLIST**

- [ ] Access Google Cloud Console
- [ ] Navigate to OAuth consent screen
- [ ] Update app name to "Bloomwell AI"
- [ ] Update app home page URL
- [ ] Add support email
- [ ] Save changes
- [ ] Wait 5-10 minutes for propagation
- [ ] Test with new user registration
- [ ] Test with existing user login
- [ ] Verify consent screen shows "Bloomwell AI"

---

## 🐛 **TROUBLESHOOTING**

### Issue: Can't find OAuth consent screen

**Solution**: Make sure you've enabled Google+ API or Google Identity Platform

### Issue: Changes not appearing

**Solution**:

1. Clear browser cache
2. Wait 10 minutes
3. Try incognito/private window
4. Sign out of all Google accounts and try again

### Issue: "Access blocked" error

**Solution**:

1. Verify app is in "Testing" mode
2. Add your email to test users list
3. Check redirect URI matches exactly

### Issue: Existing users affected

**Solution**: Branding changes don't affect existing users - they'll see the new name on their next sign-in

---

## 📸 **SCREENSHOTS TO VERIFY**

After completing the fix, the Google OAuth screen should show:

```
┌─────────────────────────────────────┐
│          [Google Logo]              │
│                                     │
│   Sign in to continue to            │
│      Bloomwell AI                   │
│                                     │
│   This will allow Bloomwell AI to:  │
│   • View your email address         │
│   • See your personal info          │
│                                     │
│   [Cancel]  [Continue]              │
└─────────────────────────────────────┘
```

---

## ✅ **SUCCESS CRITERIA**

You'll know the fix is complete when:

1. ✅ Google consent screen shows "Bloomwell AI" (not "AI nonprofit chat product 2025")
2. ✅ New users can sign up via Google
3. ✅ Existing users can still sign in
4. ✅ User data is saved correctly in database

---

## 📞 **NEED HELP?**

If you don't have access to the Google Cloud Console:

1. Check who created the OAuth app originally
2. Request owner/editor access to the project
3. Or create a new OAuth app with correct branding

---

**Last Updated**: October 9, 2025  
**Status**: Ready to implement  
**Estimated Time**: 10 minutes + 5-10 minutes propagation

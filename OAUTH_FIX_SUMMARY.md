# Google OAuth Branding Fix - Quick Action Guide

## 🎯 **IMMEDIATE ACTION REQUIRED**

The Google OAuth branding issue is **NOT a code problem** - it's a Google Cloud Console configuration.

---

## ⚡ **QUICK FIX (10 Minutes)**

### What You Need to Do:

1. **Access Google Cloud Console**
   - URL: https://console.cloud.google.com
   - Sign in with your Google account

2. **Navigate to OAuth Settings**
   - Left sidebar → "APIs & Services"
   - Click "OAuth consent screen"

3. **Edit Application Name**
   - Click "Edit App" button
   - Find "App name" field
   - Change from: `AI nonprofit chat product 2025`
   - Change to: `Bloomwell AI`
   - Click "Save and Continue"

4. **Wait for Propagation**
   - Changes take 5-10 minutes to appear
   - Clear browser cache if needed

5. **Test the Fix**
   - Server is running: ✅ http://localhost:3000
   - Open incognito window
   - Go to: http://localhost:3000/auth/register
   - Click "Continue with Google"
   - **Verify**: Consent screen shows "Bloomwell AI"

---

## 📚 **DOCUMENTATION CREATED**

I've created 2 comprehensive guides for you:

### 1. **GOOGLE_OAUTH_BRANDING_FIX.md**

- Complete step-by-step instructions
- Screenshots and examples
- Troubleshooting guide
- Best practices

### 2. **OAUTH_TEST_CHECKLIST.md**

- Testing procedures
- Verification steps
- Success criteria
- Common issues and solutions

---

## ✅ **YOUR CODE IS ALREADY CORRECT**

No code changes needed! Your OAuth implementation is properly configured:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
});
```

The app name displayed to users is controlled by Google Cloud Console, not your code.

---

## 🧪 **TESTING AFTER FIX**

Once you've updated Google Cloud Console:

### Test 1: New User Sign-up

```bash
# 1. Open incognito window
# 2. Visit: http://localhost:3000/auth/register
# 3. Click "Continue with Google"
# 4. Verify consent screen shows "Bloomwell AI"
```

### Test 2: Verify Database

```bash
cd ~/nonprofit-ai-assistant
sqlite3 prisma/dev.db "SELECT email, name FROM User WHERE email LIKE '%@gmail.com' LIMIT 5;"
```

---

## 📋 **CHECKLIST**

- [ ] Access Google Cloud Console
- [ ] Navigate to OAuth consent screen
- [ ] Edit app name to "Bloomwell AI"
- [ ] Save changes
- [ ] Wait 10 minutes
- [ ] Clear browser cache
- [ ] Test in incognito mode
- [ ] Verify consent screen shows correct name
- [ ] Test login flow
- [ ] Confirm database entry created

---

## ⚠️ **IMPORTANT NOTES**

### If You Don't Have Access

If you don't have access to the Google Cloud Console:

1. Check who created the OAuth app
2. Request owner/editor access to the Google Cloud project
3. Or create a new OAuth app with correct credentials

### Current Status

- ✅ Your code is correct
- ✅ Server is running
- ⏳ Waiting for Google Cloud Console update
- 🔄 No code changes needed

### What Won't Work

These won't fix the issue:

- ❌ Changing environment variables
- ❌ Updating NextAuth configuration
- ❌ Modifying OAuth provider settings in code
- ❌ Restarting the server

Only updating Google Cloud Console will fix the branding.

---

## 🚀 **AFTER THE FIX**

Once the branding is updated and tested:

### Recommended Improvements (Optional)

1. Add logo to OAuth consent screen (120x120px PNG)
2. Add privacy policy URL
3. Add terms of service URL
4. Configure support email
5. Verify scopes are minimal (only email and profile)

### For Production Deployment

1. Update app status from "Testing" to "In Production"
2. Add production redirect URIs:
   - `https://bloomwell-ai.com/api/auth/callback/google`
3. Complete Google verification process if required
4. Update environment variables for production

---

## 📞 **NEED HELP?**

### Can't Find OAuth Consent Screen?

- Make sure you're in the correct Google Cloud project
- Check you have owner or editor permissions
- Verify OAuth app was created (check credentials)

### Changes Not Appearing?

- Wait full 10 minutes
- Clear ALL browser cache
- Try different browser
- Use incognito/private mode
- Sign out of all Google accounts first

### Still Seeing Old Name?

- Double-check you saved changes
- Verify you're testing with correct Google account
- Check if app is in "Testing" mode (requires test users)

---

## ✨ **EXPECTED OUTCOME**

### Before Fix:

```
"Sign in to continue to AI nonprofit chat product 2025"
```

### After Fix:

```
"Sign in to continue to Bloomwell AI"
```

---

**Created**: October 9, 2025  
**Server Status**: ✅ Running on port 3000  
**Code Status**: ✅ Correct (no changes needed)  
**Action Required**: Update Google Cloud Console  
**Estimated Time**: 10 minutes + 10 minutes propagation

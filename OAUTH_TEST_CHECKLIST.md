# OAuth Testing Checklist - Bloomwell AI

## 🎯 **Testing After Google Cloud Console Update**

### Pre-Test Setup

- [ ] Updated app name in Google Cloud Console to "Bloomwell AI"
- [ ] Waited 10 minutes for changes to propagate
- [ ] Server is running: `http://localhost:3000`
- [ ] Using incognito/private browser window

---

## ✅ **Test 1: New User Registration**

### Steps:

1. Open incognito window
2. Navigate to: `http://localhost:3000/auth/register`
3. Click "Continue with Google" button
4. Check Google consent screen

### Expected Results:

- ✅ Consent screen shows: **"Sign in to continue to Bloomwell AI"**
- ✅ Requested permissions shown:
  - View your email address
  - View your basic profile info
- ✅ After authorization, redirected to dashboard/onboarding
- ✅ User created in database

### Actual Results:

```
Consent screen text: _________________________________
Redirect URL: _________________________________
User created: [ ] Yes  [ ] No
```

---

## ✅ **Test 2: Existing User Login**

### Steps:

1. Open incognito window
2. Navigate to: `http://localhost:3000/auth/login`
3. Click "Sign in with Google" button
4. Select existing Google account

### Expected Results:

- ✅ If previously authorized: Direct login (no consent screen)
- ✅ If not authorized: Shows updated "Bloomwell AI" consent screen
- ✅ Successfully logs in
- ✅ Redirected to user dashboard

### Actual Results:

```
Login successful: [ ] Yes  [ ] No
Redirect URL: _________________________________
Error messages (if any): _________________________________
```

---

## ✅ **Test 3: Verify Database Entry**

### After successful Google sign-in, verify:

```bash
# Check user was created in database
cd ~/nonprofit-ai-assistant
sqlite3 prisma/dev.db "SELECT email, name, image FROM User WHERE email = 'your-test-email@gmail.com';"
```

### Expected Results:

- ✅ User email stored correctly
- ✅ User name from Google profile
- ✅ Profile image URL from Google (optional)
- ✅ No password field (OAuth users don't need passwords)

### Actual Results:

```
Email: _________________________________
Name: _________________________________
Image URL: _________________________________
```

---

## ✅ **Test 4: Multiple Sign-in Methods**

Test that users can:

### Scenario A: Email → Google (Same Email)

1. Register with email: `test@example.com`
2. Try signing in with Google using same email
3. **Expected**: Should link accounts or show error

### Scenario B: Google → Email (Same Email)

1. Register with Google: `test@gmail.com`
2. Try registering with email using same address
3. **Expected**: Should show "Email already exists" or auto-link

---

## ✅ **Test 5: Error Handling**

Test error scenarios:

### Test 5A: Cancel OAuth Flow

1. Start Google sign-in
2. Click "Cancel" on consent screen
3. **Expected**: Return to login page with message

### Test 5B: Invalid Credentials

1. Use test account not in "Test users" list (if app in Testing mode)
2. **Expected**: "Access blocked" error with clear message

### Test 5C: Network Error

1. Disconnect internet during OAuth flow
2. **Expected**: Graceful error message, not crash

---

## 🔍 **Visual Verification**

### Consent Screen Should Show:

```
┌─────────────────────────────────────┐
│          [Google Logo]              │
│                                     │
│   Sign in to continue to            │
│      Bloomwell AI              ← VERIFY THIS
│                                     │
│   This will allow Bloomwell AI to:  │
│   • View your email address         │
│   • See your personal info          │
│                                     │
│   [Cancel]  [Continue]              │
└─────────────────────────────────────┘
```

**NOT**: "AI nonprofit chat product 2025"

---

## 🐛 **Common Issues & Solutions**

### Issue 1: Old name still showing

**Solution**:

- Clear browser cache completely
- Wait 10 more minutes
- Try different browser
- Check you saved changes in Google Cloud Console

### Issue 2: "Access blocked: This app's request is invalid"

**Solution**:

- Verify redirect URI in Google Cloud Console matches exactly:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://bloomwell-ai.com/api/auth/callback/google`

### Issue 3: User not created in database

**Solution**:

- Check Prisma connection is working
- Verify User model has correct schema
- Check server logs for errors

### Issue 4: "Error 400: redirect_uri_mismatch"

**Solution**:

- Add these redirect URIs in Google Cloud Console:
  ```
  http://localhost:3000/api/auth/callback/google
  http://127.0.0.1:3000/api/auth/callback/google
  ```

---

## 📊 **Success Criteria**

All tests pass when:

- ✅ Consent screen displays "Bloomwell AI"
- ✅ New users can register via Google
- ✅ Existing users can login via Google
- ✅ Users stored correctly in database
- ✅ No authentication errors
- ✅ Proper redirects after login
- ✅ Error handling works gracefully

---

## 📝 **Test Results Summary**

**Date Tested**: ********\_\_********  
**Tester**: ********\_\_********

| Test                  | Status            | Notes                |
| --------------------- | ----------------- | -------------------- |
| New User Registration | [ ] Pass [ ] Fail | ******\_\_\_\_****** |
| Existing User Login   | [ ] Pass [ ] Fail | ******\_\_\_\_****** |
| Database Entry        | [ ] Pass [ ] Fail | ******\_\_\_\_****** |
| Multiple Sign-in      | [ ] Pass [ ] Fail | ******\_\_\_\_****** |
| Error Handling        | [ ] Pass [ ] Fail | ******\_\_\_\_****** |

**Overall Status**: [ ] All Pass [ ] Some Failures [ ] Major Issues

---

## 🚀 **Next Steps After Testing**

Once all tests pass:

1. [ ] Document the Google OAuth setup
2. [ ] Add test users (if needed)
3. [ ] Prepare for production deployment
4. [ ] Update redirect URIs for production domain
5. [ ] Complete Google verification process (if required)

---

**Testing Guide Version**: 1.0  
**Last Updated**: October 9, 2025

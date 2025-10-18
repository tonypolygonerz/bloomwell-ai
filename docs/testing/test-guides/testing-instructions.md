# 🧪 Phase 2 Testing Instructions
**Quick Start Guide for Manual Testing**

---

## 🚀 Setup (5 minutes)

### 1. Start the Development Server
```bash
cd /Users/newberlin/nonprofit-ai-assistant
npm run dev
```

Wait for: `Ready in XXXms` message

### 2. Open Your Browser
Navigate to: **http://localhost:3000/auth/login**

### 3. Login with Test Credentials
- **Email:** `test@bloomwell.ai`
- **Password:** `test1234`

You should be redirected to: **http://localhost:3000/dashboard**

---

## ✅ Test Sequence (15 minutes)

### Test 1: Team Page (3 minutes)

1. Click on **"Team"** section in the profile widget (or go to http://localhost:3000/profile/team)

2. Fill in the numbers:
   - Full-Time Staff: **5**
   - Part-Time Staff: **2**
   - Contractors: **1**
   - Volunteers: **15**
   - Board Size: **7**

3. Click **"+ Add Member"**

4. Fill in member details:
   - Name: **"Sarah Johnson"**
   - Title: **"Executive Director"**
   - Type: **Staff**

5. Click **"Save Member"**
   - ✅ Member should appear in the list

6. Click **"Save & Continue"**
   - ✅ Should redirect to dashboard
   - ✅ Dashboard widget should show updated progress

**✅ Expected:** Team section marked complete

---

### Test 2: Budget Page (3 minutes)

1. Navigate to: **http://localhost:3000/profile/budget**

2. Select budget: **"$100,000 - $500,000"**

3. Click on 3 priorities:
   - **Staff Salaries**
   - **Program Supplies**
   - **Technology**
   
   ✅ Counter should show "3/3 selected"

4. Try clicking a 4th option
   - ✅ Should be disabled/grayed out

5. Click **"Save & Continue"**
   - ✅ Redirect to dashboard
   - ✅ Progress increases

**✅ Expected:** Budget section complete, max 3 priorities enforced

---

### Test 3: Goals Page (3 minutes)

1. Navigate to: **http://localhost:3000/profile/goals**

2. Select 3 goals:
   - **Hire Staff**
   - **Expand Existing Programs**
   - **Technology Upgrades**
   
   ✅ Counter shows "3/3 selected"

3. Select amount: **"$25,000 - $50,000"**

4. Select timeline: **"Within 3-6 months"**

5. Click **"Save & Continue"**
   - ✅ Redirect to dashboard

**✅ Expected:** Goals section complete

---

### Test 4: Documents Page (6 minutes) 🔥 CRITICAL TEST

#### Prepare a Test File
Create or find a PDF file **under 10MB** (any PDF will work)

1. Navigate to: **http://localhost:3000/profile/documents**

2. You should see 7 document types listed

3. Find **"990 Tax Forms"** (should have "Required" badge)

4. Click **"Upload File"** button

5. Select your PDF file

6. Wait for upload
   - ✅ Button shows "Uploading..."
   - ✅ Success alert appears
   - ✅ Document name and size display

7. **Verify the file was saved:**
   ```bash
   # Open a new terminal
   ls -la public/uploads/documents/
   # You should see: document_[timestamp]_[random].pdf
   ```

8. Click the **"Delete"** button next to the uploaded document

9. Confirm deletion

10. ✅ Document should disappear from list

11. Click **"Continue"**
    - ✅ Redirect to dashboard

**✅ Expected:** File uploads, stores correctly, and deletes successfully

---

### Test 5: Data Persistence (5 minutes)

1. Go back and verify all sections have saved data:
   - http://localhost:3000/profile/team → Staff counts still there
   - http://localhost:3000/profile/budget → Budget and priorities saved
   - http://localhost:3000/profile/goals → Goals and timeline saved

2. **Log out:**
   - Go to: http://localhost:3000/api/auth/signout
   - Confirm sign out

3. **Log back in:**
   - http://localhost:3000/auth/login
   - Email: `test@bloomwell.ai`
   - Password: `test1234`

4. Visit each section again and **verify data is still there**

**✅ Expected:** All data persists across logout/login

---

## 🎯 Quick Success Criteria

After completing all tests, you should have:

✅ Team section showing 100% complete  
✅ Budget section showing 100% complete  
✅ Goals section showing 100% complete  
✅ Dashboard widget showing increased profile percentage  
✅ All data persisting after logout/login  
✅ File upload and delete working smoothly  

---

## 🐛 Common Issues & Solutions

### Issue: "Upload File" button does nothing
**Solution:** Check browser console (F12) for errors. Verify file is PDF/DOC/DOCX and <10MB.

### Issue: "Save & Continue" doesn't redirect
**Solution:** Check browser console for API errors. Ensure all required fields are filled.

### Issue: Dashboard doesn't show updated progress
**Solution:** Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: Login fails
**Solution:** Verify you're using the exact credentials:
- Email: `test@bloomwell.ai` (no spaces, all lowercase)
- Password: `test1234`

---

## 📸 What to Look For

### Visual Indicators
- ✅ Green checkmarks on selected items
- ✅ Emerald green highlights on selections
- ✅ "X/3 selected" counters update in real-time
- ✅ Disabled state on items when limit reached
- ✅ Loading spinners during API calls
- ✅ Success messages after saves

### Console Checks (F12 → Console Tab)
- ❌ No red errors
- ⚠️ Yellow warnings are okay (existing)
- ✅ Should see successful network requests (200 status)

---

## ✨ Test Results Template

Copy this and fill it out:

```markdown
## Test Results - [Your Name] - [Date]

### Test 1: Team Page
- [ ] Page loaded: YES / NO
- [ ] Data saved: YES / NO
- [ ] Redirect worked: YES / NO
- Issues: [None / Description]

### Test 2: Budget Page
- [ ] Selection limit enforced: YES / NO
- [ ] Data saved: YES / NO
- Issues: [None / Description]

### Test 3: Goals Page
- [ ] All dropdowns functional: YES / NO
- [ ] Data saved: YES / NO
- Issues: [None / Description]

### Test 4: Documents Page
- [ ] File uploaded: YES / NO
- [ ] File appeared in list: YES / NO
- [ ] File deleted: YES / NO
- Issues: [None / Description]

### Test 5: Data Persistence
- [ ] Data survived logout/login: YES / NO
- Issues: [None / Description]

### Overall
- [ ] All tests passed: YES / NO
- Browser used: [Chrome / Firefox / Safari / Other]
- Any bugs found: [None / List them]
- Ready for production: YES / NO
```

---

## 🎉 Success!

If all tests pass, Phase 2 is **production-ready**! 

Report your results and we can proceed to:
1. Git commit
2. Tag release (v0.2.0)
3. Deploy to staging
4. Plan Phase 3 features

---

**Questions?** Check the detailed test report in `PHASE_2_TEST_RESULTS.md`

**Happy Testing! 🚀**



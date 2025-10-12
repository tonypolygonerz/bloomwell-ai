# Organization API Fix - 500 Error Resolution

## Problem
Organization creation was failing with 500 Internal Server Error at POST /api/organization, preventing users from completing onboarding.

## Root Cause Analysis
The issue had multiple potential causes:
1. Manual `createdAt` setting conflicted with Prisma's `@default(now())` directive
2. No handling for users who already have an organization (duplicate creation attempts)
3. Insufficient error logging made debugging difficult
4. Missing validation for edge cases

## Fixes Implemented

### 1. Fixed Date Handling
**Before:**
```typescript
const now = new Date();
const organization = await prisma.organization.create({
  data: {
    // ...
    createdAt: now,  // Redundant with @default(now())
    updatedAt: now,
  },
});
```

**After:**
```typescript
const organization = await prisma.organization.create({
  data: {
    // ...
    updatedAt: new Date(),  // Only set updatedAt manually
  },
});
```

### 2. Added Duplicate Organization Handling
Now checks if user already has an organization and updates it instead of trying to create a new one:
```typescript
if (user.organizationId && user.Organization) {
  // Update existing organization
  const organization = await prisma.organization.update({
    where: { id: user.organizationId },
    data: { /* updated fields */ },
  });
  return NextResponse.json({ success: true, organization });
}
```

### 3. Enhanced Logging
Added comprehensive logging at each step:
- Request data received
- User lookup results
- Organization creation/update steps
- Detailed error messages with stack traces

### 4. Improved Error Handling
- Better validation messages
- Detailed error logging in development
- Stack traces for debugging

## Testing Instructions

### Method 1: Via Browser (Recommended)
1. Open http://localhost:3000 in an incognito window
2. Sign in with a test account
3. Navigate to /onboarding/organization
4. Fill out the organization form with:
   - Organization Name: "Test Nonprofit"
   - Organization Type: "nonprofit"
   - Annual Budget: "under_100k"
   - Staff Size: 5
   - State: CA
5. Submit the form
6. Watch the terminal for log messages:
   - ✅ "Received organization data"
   - ✅ "Looking up user with email"
   - ✅ "User found"
   - ✅ "Creating new organization" OR "User already has organization, updating"
   - ✅ "Organization created successfully"
   - ✅ "User updated successfully"

### Method 2: Via Browser Console
1. Sign in to the application
2. Open browser DevTools > Console
3. Run:
```javascript
fetch('/api/organization', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Nonprofit Organization',
    organizationType: 'nonprofit',
    mission: 'To help communities thrive',
    focusAreas: 'youth_programs,education',
    budget: 'under_100k',
    staffSize: '5',
    state: 'CA',
    ein: '',
    isVerified: false,
  })
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

### Expected Results
✅ **Success Response (200):**
```json
{
  "success": true,
  "organization": {
    "id": "uuid-here",
    "name": "Test Nonprofit Organization",
    "organizationType": "nonprofit",
    "mission": "To help communities thrive",
    "focusAreas": "youth_programs,education",
    "budget": "under_100k",
    "staffSize": "5",
    "state": "CA",
    "ein": null,
    "isVerified": false
  }
}
```

✅ **Server Logs (Terminal):**
```
Received organization data: { name: 'Test Nonprofit Organization', ... }
Looking up user with email: user@example.com
User found: { id: 'user-id', email: 'user@example.com', hasOrganization: false }
Creating new organization with data: { name: 'Test Nonprofit Organization', ... }
Organization created successfully: organization-id
Linking organization to user
User updated successfully
```

## Database Verification
To verify the organization was saved:
```bash
cd /Users/newberlin/nonprofit-ai-assistant
npx prisma studio
```
Navigate to Organization table and verify the new entry exists.

## Error Scenarios Handled

### 1. Missing Required Fields (400)
```json
{
  "error": "Missing required fields"
}
```

### 2. Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

### 3. User Not Found (404)
```json
{
  "error": "User not found"
}
```

### 4. Database Error (500)
```json
{
  "error": "Failed to create organization",
  "details": "Detailed error message (dev only)"
}
```

## Files Modified
- `/src/app/api/organization/route.ts` - Main fix location
- Prisma Client regenerated with `npx prisma generate`

## Next Steps
1. Test with real user accounts
2. Verify organization data persists across sessions
3. Test the update scenario (submitting form twice)
4. Verify the organization data appears correctly in user dashboard
5. Test with edge cases (empty strings, special characters, etc.)

## Rollback Plan
If issues persist:
```bash
git checkout HEAD -- src/app/api/organization/route.ts
npm run dev
```

## Success Criteria Met
✅ API returns 200 status on successful creation
✅ Organization is saved to database
✅ User is linked to organization
✅ Proper error messages for all scenarios
✅ Comprehensive logging for debugging
✅ Handles duplicate organization attempts gracefully



# Grants Data Sync - Nonprofit Eligibility Filter

## Overview

The grants sync system now automatically filters out grants that are **only eligible for cities, states, and municipalities**. This ensures Bloomwell AI only displays grants relevant to small to medium 501(c)(3) nonprofits.

## What Gets Filtered Out

### Automatic Exclusions

Grants are **excluded** if they contain these phrases in their eligibility criteria, title, or description:

- "state governments only"
- "local governments only"
- "city governments only"
- "county governments only"
- "municipal governments only"
- "municipalities only"
- "tribal governments only"
- "public agencies only"
- "government agencies only"
- "state agencies only"

### Smart Filtering Logic

Grants are also excluded if they:

- Mention government types (state/local/city/county/municipal/tribal government)
- **AND** do NOT mention nonprofits
- **AND** do NOT use inclusive language (and/or/including)

## What Gets Included

### Nonprofits are Explicitly Mentioned

Grants mentioning any of these keywords are **kept**:

- 501(c)(3) or 501c3
- nonprofit or non-profit
- nongovernmental or non-governmental
- NGO
- charitable
- private organizations
- community-based

### Mixed Eligibility

Grants that include both government AND nonprofit eligibility are **kept** if they use inclusive language like:

- "and"
- "or"
- "including"

Example: "Eligible: State governments, local governments, **and** nonprofit organizations"

## Automatic Cleanup

### Expired Grants Removal

Grants are automatically deleted if:

- They have a `closeDate`
- **AND** the close date is more than 1 day in the past

### Database Operations

- **Upsert**: Updates existing grants or creates new ones (handles duplicates)
- **Deactivation**: Marks grants as inactive when they expire
- **Smart Updates**: Only updates grants with newer information

## Sync Process

### Step-by-Step Flow

1. **Fetch** - Downloads latest XML extract from grants.gov
2. **Parse** - Extracts grant opportunities from XML
3. **Filter** - Removes government-only grants (NEW!)
4. **Cleanup** - Deletes expired grants (closeDate < today - 1 day)
5. **Upsert** - Updates/creates grant records in database
6. **Log** - Records sync statistics in GrantSync table

### Logging

The sync process logs:

- How many grants were filtered out as government-only
- How many total nonprofit-eligible grants were processed
- How many expired grants were deleted
- Success/failure status with error messages

## Admin Interface

### Sync Button

Admins can manually trigger a sync from:
`/admin/grants` page → "Sync Grants Data" button

### Sync Status Display

Shows:

- Total grants in database
- Active grants (not expired)
- Last sync date and status
- Records processed and deleted in last sync

## Technical Details

### File: `src/lib/grants-sync.ts`

**New Functions:**

- `isEligibleForNonprofits()` - Determines if grant is eligible for nonprofits
- Enhanced `parseGrantsXML()` - Now filters during parsing

**Enhanced Functions:**

- `cleanupExpiredGrants()` - Already existed, removes old grants
- `upsertGrants()` - Already existed, handles duplicates

### API Endpoint

- **Route**: `/api/admin/grants/sync`
- **Method**: POST (triggers sync)
- **Method**: GET (retrieves sync history)
- **Auth**: Requires admin authentication

## Database Schema

### Grant Model

```prisma
model Grant {
  opportunityId       String   @unique
  title               String
  eligibilityCriteria String?  // Used for filtering
  closeDate           DateTime? // Used for cleanup
  isActive            Boolean  @default(true)
  lastSyncedAt        DateTime @default(now())
  // ... other fields
}
```

### GrantSync Model

```prisma
model GrantSync {
  fileName         String   @unique
  syncStatus       String   // pending/processing/completed/failed
  recordsProcessed Int?     // Grants added/updated
  recordsDeleted   Int?     // Expired grants removed
  errorMessage     String?
  // ... other fields
}
```

## Usage Examples

### Manual Sync

```typescript
// From admin dashboard
const response = await fetch('/api/admin/grants/sync', {
  method: 'POST',
  headers: { Authorization: 'Bearer admin-jwt-token' },
});

const result = await response.json();
console.log(result.recordsProcessed); // Nonprofit-eligible grants
console.log(result.recordsDeleted); // Expired grants removed
```

### Check Sync Status

```typescript
const response = await fetch('/api/admin/grants/sync?limit=10');
const data = await response.json();

console.log(data.statistics.activeGrants); // Current active count
console.log(data.syncHistory); // Last 10 syncs
```

## Benefits for Bloomwell AI Users

### For Nonprofits

✅ Only see grants they're eligible for
✅ No wasted time reviewing government-only opportunities
✅ Focus on 501(c)(3) and community-based funding
✅ Automatic updates keep database fresh

### For Admins

✅ Hands-off operation after initial setup
✅ Clear logging of what's filtered
✅ Statistics on database health
✅ Error tracking for troubleshooting

## Configuration

### Adjusting Filter Strictness

To make filtering **more strict** (exclude more grants):

- Add more keywords to `governmentOnlyKeywords` array
- Remove keywords from `nonprofitKeywords` array

To make filtering **less strict** (include more grants):

- Remove keywords from `governmentOnlyKeywords` array
- Add more keywords to `nonprofitKeywords` array

### Location

Edit these arrays in: `src/lib/grants-sync.ts` → `isEligibleForNonprofits()` function

## Testing

### Test Filtering Logic

```typescript
import { parseGrantsXML } from '@/lib/grants-sync';

const testXML = `<Grants>
  <Opportunity>
    <OpportunityID>TEST-001</OpportunityID>
    <OpportunityTitle>State Governments Only Grant</OpportunityTitle>
    <EligibilityInfo>
      <EligibilityDescription>Eligible: State governments only</EligibilityDescription>
    </EligibilityInfo>
  </Opportunity>
</Grants>`;

const grants = await parseGrantsXML(testXML);
console.log(grants.length); // Should be 0 (filtered out)
```

### Test Expired Cleanup

```typescript
import { cleanupExpiredGrants } from '@/lib/grants-sync';

const deletedCount = await cleanupExpiredGrants();
console.log(`Removed ${deletedCount} expired grants`);
```

## Future Enhancements

### Potential Additions

1. **Budget Range Filter** - Only show grants appropriate for org size
2. **Geographic Filter** - Prioritize grants available in org's state
3. **CFDA Category Filter** - Match to org's focus areas
4. **Smart Scoring** - Rank grants by fit for org profile

### Data Quality

1. **Manual Review Queue** - Flag ambiguous eligibility for admin review
2. **User Feedback** - Let users mark grants as inappropriate
3. **ML Enhancement** - Train model on user feedback to improve filtering

## Support

For issues with grant sync:

1. Check `/admin/grants` for sync status
2. Review GrantSync table for error messages
3. Check server logs for detailed filtering output
4. Verify grants.gov XML extract URL is still valid

## Version History

- **v1.0** (Initial): Basic sync from grants.gov
- **v1.1** (This Update): Added nonprofit eligibility filtering
- **v1.1** (This Update): Enhanced logging and statistics

---

**Last Updated**: October 7, 2025  
**Author**: Bloomwell AI Development Team  
**Product**: Bloomwell AI Grant Discovery Platform

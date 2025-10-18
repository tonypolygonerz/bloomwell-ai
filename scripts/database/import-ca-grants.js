const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

function createUniqueOpportunityId(grantTitle, grantUrl) {
  // Extract a unique identifier from the URL or title
  const urlMatch = grantUrl.match(/\/grants\/([^\/]+)\/$/);
  if (urlMatch && urlMatch[1]) {
    return `CA-${urlMatch[1]}`;
  }
  
  // Fallback: create from title
  const slug = grantTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  return `CA-${slug}-${randomUUID().substring(0, 8)}`;
}

function parseDeadline(deadlineString) {
  if (!deadlineString || deadlineString.trim() === '') {
    return null;
  }
  
  try {
    const date = new Date(deadlineString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (_error) {
    return null;
  }
}

function mapCaGrantToDb(caGrant) {
  const opportunityId = createUniqueOpportunityId(
    caGrant.grant_title,
    caGrant.grant_url
  );

  // Extract agency information
  let agencyCode = caGrant.agency || 'CA-STATE';
  if (caGrant.department) {
    agencyCode = caGrant.department;
  }

  // Build comprehensive description
  let description = caGrant.purpose || caGrant.grant_title;
  if (caGrant.details && caGrant.details.trim()) {
    description += `\n\n${caGrant.details}`;
  }

  return {
    id: randomUUID(),
    opportunityId,
    opportunityNumber: null, // CA grants don't have federal opportunity numbers
    title: caGrant.grant_title,
    agencyCode,
    cfdaNumber: null, // State grants don't have CFDA numbers
    postingDate: caGrant.scrape_timestamp ? new Date(caGrant.scrape_timestamp) : new Date(),
    closeDate: parseDeadline(caGrant.deadline),
    description: description.substring(0, 10000), // Limit description length
    eligibilityCriteria: caGrant.eligible_applicants || null,
    awardCeiling: null, // Parse from funding_amount if available
    awardFloor: null,
    estimatedFunding: null,
    category: caGrant.grant_type || 'California State Grant',
    fundingInstrument: caGrant.disbursement_method || null,
    isActive: true,
    lastSyncedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function importCaGrants() {
  const csvFiles = [
    '/Volumes/POLYGONERZ BACK UP/2023 Work/Crawlee Python/ca_grants_20251012_113853.csv',
    '/Volumes/POLYGONERZ BACK UP/2023 Work/Crawlee Python/ca_grants_20251012_114013.csv'
  ];

  console.log('🚀 Starting California Grants Import...\n');

  let totalProcessed = 0;
  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const seenOpportunityIds = new Set();

  for (const csvFile of csvFiles) {
    console.log(`📄 Processing file: ${path.basename(csvFile)}`);
    
    try {
      const caGrants = await parseCsvFile(csvFile);
      console.log(`   Found ${caGrants.length} grants in file\n`);

      for (const caGrant of caGrants) {
        totalProcessed++;

        try {
          const mappedGrant = mapCaGrantToDb(caGrant);
          
          // Skip duplicates within the same import batch
          if (seenOpportunityIds.has(mappedGrant.opportunityId)) {
            totalSkipped++;
            console.log(`   ⏭️  Skipping duplicate: ${mappedGrant.title.substring(0, 60)}...`);
            continue;
          }
          
          seenOpportunityIds.add(mappedGrant.opportunityId);

          // Check if grant already exists in database
          const existingGrant = await prisma.grant.findUnique({
            where: { opportunityId: mappedGrant.opportunityId }
          });

          if (existingGrant) {
            // Update existing grant
            await prisma.grant.update({
              where: { opportunityId: mappedGrant.opportunityId },
              data: {
                title: mappedGrant.title,
                description: mappedGrant.description,
                closeDate: mappedGrant.closeDate,
                eligibilityCriteria: mappedGrant.eligibilityCriteria,
                category: mappedGrant.category,
                fundingInstrument: mappedGrant.fundingInstrument,
                lastSyncedAt: new Date(),
                updatedAt: new Date(),
              }
            });
            totalSkipped++;
            console.log(`   🔄 Updated: ${mappedGrant.title.substring(0, 60)}...`);
          } else {
            // Insert new grant
            await prisma.grant.create({
              data: mappedGrant
            });
            totalImported++;
            console.log(`   ✅ Imported: ${mappedGrant.title.substring(0, 60)}...`);
          }

        } catch (error) {
          totalErrors++;
          console.error(`   ❌ Error processing grant: ${caGrant.grant_title}`);
          console.error(`      ${error.message}`);
        }
      }

      console.log(`\n✅ Completed file: ${path.basename(csvFile)}\n`);

    } catch (error) {
      console.error(`❌ Error reading file ${csvFile}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary');
  console.log('='.repeat(60));
  console.log(`Total grants processed: ${totalProcessed}`);
  console.log(`New grants imported:    ${totalImported}`);
  console.log(`Existing grants updated: ${totalSkipped - (totalProcessed - totalImported - totalSkipped - totalErrors)}`);
  console.log(`Duplicates skipped:     ${totalSkipped}`);
  console.log(`Errors encountered:     ${totalErrors}`);
  console.log('='.repeat(60));

  // Get total grant count
  const totalGrants = await prisma.grant.count();
  console.log(`\n📈 Total grants in database: ${totalGrants}`);
}

async function main() {
  try {
    await importCaGrants();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();



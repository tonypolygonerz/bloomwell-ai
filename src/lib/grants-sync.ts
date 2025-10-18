import { parseStringPromise } from 'xml2js';
import AdmZip from 'adm-zip';
import { prisma } from './prisma';

export interface GrantFileInfo {
  fileName: string;
  extractedDate: Date;
  fileSize: string;
}

export interface GrantData {
  opportunityId: string;
  opportunityNumber?: string;
  title: string;
  agencyCode?: string;
  cfdaNumber?: string;
  postingDate?: Date;
  closeDate?: Date;
  description?: string;
  eligibilityCriteria?: string;
  awardCeiling?: number;
  awardFloor?: number;
  estimatedFunding?: number;
  category?: string;
  fundingInstrument?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsDeleted: number;
  errorMessage?: string;
  fileName?: string;
  extractedDate?: Date;
  fileSize?: string;
}

/**
 * Fetches the grants.gov XML extract page and parses available files
 */
export async function fetchGrantsPage(): Promise<string> {
  try {
    const response = await fetch('https://www.grants.gov/xml-extract', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BloomwellAI/1.0)',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching grants page:', error);
    throw new Error(
      `Failed to fetch grants.gov page: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parses HTML table to extract available file information
 */
export function parseAvailableFiles(html: string): GrantFileInfo[] {
  try {
    console.log('3. Parsing HTML for ZIP files...');

    // Look for the specific pattern from grants.gov table
    // Pattern: <tr><td><a class="usa-link" href="URL">filename.zip</a></td><td>size</td><td>date</td></tr>
    const fileRegex =
      /<tr><td><a[^>]*href="[^"]*extracts\/([^"]+\.zip)"[^>]*>([^<]+\.zip)<\/a><\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/gi;

    const files: GrantFileInfo[] = [];
    let match;

    while ((match = fileRegex.exec(html)) !== null) {
      const [, hrefFileName, fileName, fileSize, extractedDateStr] = match;

      try {
        // Parse the date - format: "Sep 13, 2025 04:38:55 AM EDT"
        const dateStr = extractedDateStr.trim();
        const extractedDate = new Date(dateStr);

        if (!isNaN(extractedDate.getTime())) {
          files.push({
            fileName: fileName.trim(),
            extractedDate,
            fileSize: fileSize.trim(),
          });
          console.log(
            `3. Found file: ${fileName} (${fileSize}) - ${extractedDate.toISOString()}`
          );
        } else {
          console.warn(`3. Invalid date for file ${fileName}: ${dateStr}`);
        }
      } catch (error) {
        console.warn(`3. Failed to parse date for file ${fileName}:`, error);
      }
    }

    console.log(`3. Successfully parsed ${files.length} files`);

    // Sort by extracted date, newest first
    return files.sort(
      (a, b) => b.extractedDate.getTime() - a.extractedDate.getTime()
    );
  } catch (error) {
    console.error('Error parsing available files:', error);
    throw new Error(
      `Failed to parse grants.gov files: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Finds the latest unprocessed file by comparing against GrantSync table
 */
export async function getLatestUnprocessedFile(
  files: GrantFileInfo[]
): Promise<GrantFileInfo | null> {
  try {
    if (files.length === 0) {
      return null;
    }

    // Get all processed file names
    const processedFiles = await prisma.grantSync.findMany({
      select: { fileName: true },
      where: { syncStatus: 'completed' },
    });

    const processedFileNames = new Set(processedFiles.map(f => f.fileName));

    // Find first unprocessed file (files are already sorted by date desc)
    const unprocessedFile = files.find(
      file => !processedFileNames.has(file.fileName)
    );

    return unprocessedFile || null;
  } catch (error) {
    console.error('Error finding unprocessed file:', error);
    throw new Error(
      `Failed to find unprocessed file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Downloads ZIP file and extracts XML content in memory
 */
export async function downloadAndExtractZip(fileName: string): Promise<string> {
  try {
    // The actual URL format is different from what we construct
    const zipUrl = `https://prod-grants-gov-chatbot.s3.amazonaws.com/extracts/${fileName}`;

    console.log('5. Downloading ZIP file...');
    console.log(`Download URL: ${zipUrl}`);

    const response = await fetch(zipUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GrantSync/1.0)',
        Accept: 'application/zip, */*',
      },
      signal: AbortSignal.timeout(300000), // 5 minute timeout for large files
    });

    console.log('6. ZIP file response status:', response.status);
    console.log('6. ZIP file size:', response.headers.get('content-length'));
    console.log(
      '6. ZIP file content-type:',
      response.headers.get('content-type')
    );

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('7. ZIP file downloaded, size:', buffer.length, 'bytes');

    // Check if it's actually a ZIP file
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      console.error('File does not appear to be a valid ZIP file');
      console.error('First 100 bytes:', buffer.slice(0, 100).toString('hex'));
      throw new Error('Downloaded file is not a valid ZIP archive');
    }

    console.log('7. Extracting XML from ZIP...');

    // Extract ZIP using AdmZip
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    console.log(
      '7. ZIP entries found:',
      entries.map(e => e.entryName)
    );

    // Find the XML file (may not be the first entry)
    const xmlEntry = entries.find(
      entry => entry.entryName.endsWith('.xml') && !entry.isDirectory
    );

    if (!xmlEntry) {
      console.error('7. No XML file found in ZIP archive');
      console.error(
        '7. Available entries:',
        entries.map(e => e.entryName)
      );
      throw new Error('No XML file found in ZIP archive');
    }

    console.log('7. Found XML file:', xmlEntry.entryName);
    const xmlContent = xmlEntry.getData().toString('utf-8');
    console.log('8. XML extracted, size:', xmlContent.length, 'characters');

    // Validate XML structure
    if (!xmlContent.includes('<') || !xmlContent.includes('>')) {
      console.error('Extracted content does not appear to be valid XML');
      console.error('First 500 characters:', xmlContent.substring(0, 500));
      throw new Error('Extracted content is not valid XML');
    }

    return xmlContent;
  } catch (error) {
    console.error(`Error downloading/extracting ${fileName}:`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fileName,
      step: 'download/extract',
    });
    throw new Error(
      `Failed to download/extract ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Checks if a grant is eligible for 501(c)(3) nonprofits
 * Returns false if grant is ONLY for cities, states, municipalities
 */
function isEligibleForNonprofits(
  eligibilityCriteria?: string,
  title?: string,
  description?: string
): boolean {
  if (!eligibilityCriteria && !title && !description) {
    return true; // If no eligibility info, include it
  }

  const textToCheck =
    `${eligibilityCriteria || ''} ${title || ''} ${description || ''}`.toLowerCase();

  // Keywords that indicate government-only grants
  const governmentOnlyKeywords = [
    'state governments only',
    'local governments only',
    'city governments only',
    'county governments only',
    'municipal governments only',
    'municipalities only',
    'tribal governments only',
    'public agencies only',
    'government agencies only',
    'state agencies only',
  ];

  // If it explicitly says "only" for government entities, exclude it
  for (const keyword of governmentOnlyKeywords) {
    if (textToCheck.includes(keyword)) {
      console.log(`Excluding grant (government-only): ${title}`);
      return false;
    }
  }

  // Check if nonprofits are explicitly mentioned as eligible
  const nonprofitKeywords = [
    '501(c)(3)',
    '501c3',
    'nonprofit',
    'non-profit',
    'nongovernmental',
    'non-governmental',
    'ngo',
    'charitable',
    'private organizations',
    'community-based',
  ];

  const hasNonprofitMention = nonprofitKeywords.some(keyword =>
    textToCheck.includes(keyword)
  );

  // Check if it's ONLY for specific government types (excluding nonprofits)
  const governmentTypes = [
    'state government',
    'local government',
    'city government',
    'county government',
    'municipal government',
    'tribal government',
  ];

  const hasGovernmentType = governmentTypes.some(type =>
    textToCheck.includes(type)
  );

  // If it mentions government types but NO nonprofit keywords, likely government-only
  if (hasGovernmentType && !hasNonprofitMention) {
    // Check if it says "and" or "or" which might include multiple eligibility types
    const hasInclusiveLanguage =
      textToCheck.includes(' and ') ||
      textToCheck.includes(' or ') ||
      textToCheck.includes('including');

    if (!hasInclusiveLanguage) {
      console.log(`Excluding grant (likely government-only): ${title}`);
      return false;
    }
  }

  // Default to including the grant (err on side of inclusion)
  return true;
}

/**
 * Parses XML content to extract grant opportunities
 * Filters out grants that are only for cities, states, and municipalities
 */
export async function parseGrantsXML(xmlContent: string): Promise<GrantData[]> {
  try {
    console.log('9. Parsing XML content...');
    console.log('9. XML content length:', xmlContent.length);

    // First, try to validate XML structure using DOMParser
    let opportunities: any[] = [];

    try {
      // Try to parse with xml2js first
      const result = await parseStringPromise(xmlContent, {
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true,
      });

      console.log('9. XML parsed successfully with xml2js');
      console.log('9. Root structure:', Object.keys(result || {}));

      // Try different possible XML structures
      opportunities =
        result?.Opportunities?.Opportunity ||
        result?.OpportunityForecast?.OpportunityForecastItem ||
        result?.OpportunityForecastItem ||
        result?.Grants?.OpportunitySynopsisDetail_1_0 ||
        result?.Grants?.OpportunityForecastDetail_1_0 ||
        result?.Grants?.OpportunityForecastItem ||
        result?.Grants?.Opportunity ||
        result?.Opportunity ||
        [];

      console.log('9. Opportunities found in XML:', opportunities.length);
    } catch (xmlParseError) {
      console.error('9. XML parsing failed:', xmlParseError);

      // Try to extract opportunities manually if xml2js fails
      const opportunityMatches = xmlContent.match(
        /<OpportunityForecastItem[^>]*>[\s\S]*?<\/OpportunityForecastItem>/g
      );
      if (opportunityMatches) {
        console.log(
          '9. Found',
          opportunityMatches.length,
          'opportunities using regex'
        );
        // For now, return empty array since manual parsing is complex
        return [];
      }

      throw new Error(`XML parsing failed: ${xmlParseError instanceof Error ? xmlParseError.message : String(xmlParseError)}`);
    }

    // Handle both single opportunity and array of opportunities
    const opportunityArray = Array.isArray(opportunities)
      ? opportunities
      : [opportunities];

    console.log('10. Processing', opportunityArray.length, 'opportunities...');

    const grants: GrantData[] = [];
    for (const opp of opportunityArray) {
      try {
        // Extract basic information
        const opportunityId =
          opp?.OpportunityID?.['#text'] || opp?.OpportunityID;
        const title = opp?.OpportunityTitle?.['#text'] || opp?.OpportunityTitle;

        if (!opportunityId || !title) {
          console.warn('Skipping opportunity without required ID or title');
          continue;
        }

        // Parse dates - try multiple possible field names
        const postingDateStr =
          opp?.PostDate?.['#text'] ||
          opp?.PostDate ||
          opp?.posting_date?.['#text'] ||
          opp?.posting_date ||
          opp?.PostingDate?.['#text'] ||
          opp?.PostingDate;

        const closeDateStr =
          opp?.CloseDate?.['#text'] ||
          opp?.CloseDate ||
          opp?.close_date?.['#text'] ||
          opp?.close_date ||
          opp?.ArchiveDate?.['#text'] ||
          opp?.ArchiveDate ||
          opp?.archive_date?.['#text'] ||
          opp?.archive_date ||
          opp?.ClosingDate?.['#text'] ||
          opp?.ClosingDate;

        const postingDate = parseGrantDate(postingDateStr);
        const closeDate = parseGrantDate(closeDateStr);

        // Log date parsing for debugging
        if (!postingDate && !closeDate) {
          console.log(
            `No dates found for ${opportunityId}: ${title.substring(0, 50)}...`
          );
          // Log available fields to help debug
          const availableFields = Object.keys(opp || {});
          console.log(`  Available fields:`, availableFields.slice(0, 10));
        }

        // Skip if dates are invalid
        if (postingDate && isNaN(postingDate.getTime())) {
          console.warn(
            `Invalid posting date for ${opportunityId}: ${postingDateStr}`
          );
        }
        if (closeDate && isNaN(closeDate.getTime())) {
          console.warn(
            `Invalid close date for ${opportunityId}: ${closeDateStr}`
          );
        }

        // Extract award amounts
        const awardCeiling = parseAmount(
          opp?.AwardCeiling?.['#text'] || opp?.AwardCeiling
        );
        const awardFloor = parseAmount(
          opp?.AwardFloor?.['#text'] || opp?.AwardFloor
        );
        const estimatedFunding = parseAmount(
          opp?.EstimatedTotalProgramFunding?.['#text'] ||
            opp?.EstimatedTotalProgramFunding
        );

        // Extract agency and CFDA information
        const agencyCode = opp?.AgencyCode?.['#text'] || opp?.AgencyCode;
        const cfdaNumber =
          opp?.CFDANumbers?.CFDANumber?.['#text'] ||
          opp?.CFDANumbers?.CFDANumber;

        // Extract description and eligibility
        const description = opp?.Description?.['#text'] || opp?.Description;
        const eligibilityCriteria =
          opp?.EligibilityInfo?.EligibilityDescription?.['#text'] ||
          opp?.EligibilityInfo?.EligibilityDescription;

        // Filter out grants that are only for government entities
        if (!isEligibleForNonprofits(eligibilityCriteria, title, description)) {
          console.log(`Filtered out government-only grant: ${opportunityId}`);
          continue;
        }

        grants.push({
          opportunityId,
          opportunityNumber:
            opp?.OpportunityNumber?.['#text'] || opp?.OpportunityNumber,
          title,
          agencyCode,
          cfdaNumber,
          postingDate:
            postingDate && !isNaN(postingDate.getTime())
              ? postingDate
              : undefined,
          closeDate:
            closeDate && !isNaN(closeDate.getTime()) ? closeDate : undefined,
          description,
          eligibilityCriteria,
          awardCeiling,
          awardFloor,
          estimatedFunding,
          category:
            opp?.CategoryExplanation?.['#text'] || opp?.CategoryExplanation,
          fundingInstrument:
            opp?.FundingInstrumentType?.['#text'] || opp?.FundingInstrumentType,
        });
      } catch (error) {
        console.warn(`Error parsing opportunity ${opp?.OpportunityID}:`, error);
        // Continue processing other opportunities
      }
    }

    console.log(
      `Parsed ${grants.length} grant opportunities from XML (nonprofit-eligible only)`
    );
    console.log(
      `Note: Grants filtered out for being government-only are not included in this count`
    );
    return grants;
  } catch (error) {
    console.error('Error parsing grants XML:', error);
    throw new Error(
      `Failed to parse grants XML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Helper function to parse dates from grants.gov format
 * Handles formats like: MMDDYYYY, MM/DD/YYYY, YYYY-MM-DD, etc.
 */
function parseGrantDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;

  try {
    // Remove any whitespace
    const cleanDate = dateStr.trim();

    // Format: MMDDYYYY (08152014)
    if (/^\d{8}$/.test(cleanDate)) {
      const month = parseInt(cleanDate.substring(0, 2), 10);
      const day = parseInt(cleanDate.substring(2, 4), 10);
      const year = parseInt(cleanDate.substring(4, 8), 10);

      // Validate ranges
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day);
      }
    }

    // Try standard date parsing for other formats
    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return undefined;
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`, error);
    return undefined;
  }
}

/**
 * Helper function to parse award amounts from strings
 */
function parseAmount(amountStr: string | undefined): number | undefined {
  if (!amountStr) return undefined;

  try {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleanAmount = amountStr.replace(/[^0-9.-]/g, '');
    const amount = parseFloat(cleanAmount);

    return isNaN(amount) ? undefined : Math.round(amount);
  } catch (error) {
    console.warn(`Failed to parse amount: ${amountStr}`, error);
    return undefined;
  }
}

/**
 * Cleans up expired grants (closeDate < today - 1 day)
 * Only deletes grants that have a closeDate and it's in the past
 */
export async function cleanupExpiredGrants(): Promise<number> {
  try {
    // Ensure prisma is available
    if (!prisma || !prisma.grant) {
      console.warn('Prisma client not available, skipping cleanup');
      return 0;
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    console.log(
      `Cleaning up grants with closeDate < ${oneDayAgo.toISOString()}`
    );

    const result = await prisma.grant.deleteMany({
      where: {
        AND: [
          { closeDate: { not: null } }, // Only grants with a closeDate
          { closeDate: { lt: oneDayAgo } }, // And it's in the past
        ],
      },
    });

    console.log(`Deleted ${result.count} expired grants`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired grants:', error);
    throw new Error(
      `Failed to cleanup expired grants: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Upserts grant records into the database
 */
export async function upsertGrants(grants: GrantData[]): Promise<number> {
  try {
    // Ensure prisma is available
    if (!prisma || !prisma.grant) {
      console.error('Prisma client not available for upsert');
      return 0;
    }

    let processedCount = 0;

    // Process grants in batches to avoid memory issues
    const batchSize = 100;

    for (let i = 0; i < grants.length; i += batchSize) {
      const batch = grants.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(grants.length / batchSize);

      console.log(
        `11. Processing batch ${batchNumber}/${totalBatches} (${batch.length} grants)...`
      );

      await prisma.$transaction(
        async tx => {
          for (const grant of batch) {
            try {
              await tx.grant.upsert({
                where: { opportunityId: grant.opportunityId },
                update: {
                  opportunityNumber: grant.opportunityNumber,
                  title: grant.title,
                  agencyCode: grant.agencyCode,
                  cfdaNumber: grant.cfdaNumber,
                  postingDate: grant.postingDate,
                  closeDate: grant.closeDate,
                  description: grant.description,
                  eligibilityCriteria: grant.eligibilityCriteria,
                  awardCeiling: grant.awardCeiling,
                  awardFloor: grant.awardFloor,
                  estimatedFunding: grant.estimatedFunding,
                  category: grant.category,
                  fundingInstrument: Array.isArray(grant.fundingInstrument)
                    ? grant.fundingInstrument.join(', ')
                    : grant.fundingInstrument,
                  isActive: true,
                  lastSyncedAt: new Date(),
                  updatedAt: new Date(),
                },
                create: {
                  opportunityId: grant.opportunityId,
                  opportunityNumber: grant.opportunityNumber,
                  title: grant.title,
                  agencyCode: grant.agencyCode,
                  cfdaNumber: grant.cfdaNumber,
                  postingDate: grant.postingDate,
                  closeDate: grant.closeDate,
                  description: grant.description,
                  eligibilityCriteria: grant.eligibilityCriteria,
                  awardCeiling: grant.awardCeiling,
                  awardFloor: grant.awardFloor,
                  estimatedFunding: grant.estimatedFunding,
                  category: grant.category,
                  fundingInstrument: Array.isArray(grant.fundingInstrument)
                    ? grant.fundingInstrument.join(', ')
                    : grant.fundingInstrument,
                  isActive: true,
                  lastSyncedAt: new Date(),
                  updatedAt: new Date(),
                },
              });
              processedCount++;
            } catch (error) {
              console.warn(
                `Failed to upsert grant ${grant.opportunityId}:`,
                error
              );
              // Continue with other grants in the batch
            }
          }
        },
        {
          timeout: 120000, // 2 minute timeout per batch
        }
      );
    }

    console.log(`Successfully processed ${processedCount} grant records`);
    return processedCount;
  } catch (error) {
    console.error('Error upserting grants:', error);
    throw new Error(
      `Failed to upsert grants: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Creates or updates a GrantSync record
 */
export async function createSyncRecord(
  fileName: string,
  extractedDate: Date,
  fileSize: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  recordsProcessed?: number,
  recordsDeleted?: number,
  errorMessage?: string
): Promise<void> {
  try {
    await prisma.grantSync.upsert({
      where: { fileName },
      update: {
        syncStatus: status,
        recordsProcessed,
        recordsDeleted,
        errorMessage,
        updatedAt: new Date(),
      },
      create: {
        fileName,
        extractedDate,
        fileSize,
        syncStatus: status,
        recordsProcessed,
        recordsDeleted,
        errorMessage,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating sync record:', error);
    throw new Error(
      `Failed to create sync record: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Main sync function that orchestrates the entire process
 */
export async function syncGrants(): Promise<SyncResult> {
  const syncRecord: any = null;

  try {
    console.log('1. Starting grants sync...');

    // Step 1: Fetch and parse available files
    console.log('2. Fetching grants.gov page...');
    const html = await fetchGrantsPage();
    console.log('3. Parsing available files...');
    const files = parseAvailableFiles(html);
    console.log('3. Files found:', files.length);

    if (files.length === 0) {
      return {
        success: true,
        recordsProcessed: 0,
        recordsDeleted: 0,
        errorMessage: 'No files found on grants.gov',
      };
    }

    // Step 2: Find latest unprocessed file
    console.log('4. Finding latest unprocessed file...');
    const latestFile = await getLatestUnprocessedFile(files);
    console.log(
      '4. Latest file found:',
      latestFile ? latestFile.fileName : 'none'
    );

    if (!latestFile) {
      console.log('4. No new files to process');
      return {
        success: true,
        recordsProcessed: 0,
        recordsDeleted: 0,
        errorMessage: 'No new files to process',
      };
    }

    console.log(`4. Processing file: ${latestFile.fileName}`);

    // Step 3: Create sync record
    await createSyncRecord(
      latestFile.fileName,
      latestFile.extractedDate,
      latestFile.fileSize,
      'processing'
    );

    // Step 4: Download and extract ZIP
    const xmlContent = await downloadAndExtractZip(latestFile.fileName);

    // Step 5: Parse XML
    const grants = await parseGrantsXML(xmlContent);

    // Step 6: Cleanup expired grants
    const deletedCount = await cleanupExpiredGrants();

    // Step 7: Upsert new grants
    const processedCount = await upsertGrants(grants);

    // Step 8: Update sync record
    await createSyncRecord(
      latestFile.fileName,
      latestFile.extractedDate,
      latestFile.fileSize,
      'completed',
      processedCount,
      deletedCount
    );

    console.log('Grants sync completed successfully');

    return {
      success: true,
      recordsProcessed: processedCount,
      recordsDeleted: deletedCount,
      fileName: latestFile.fileName,
      extractedDate: latestFile.extractedDate,
      fileSize: latestFile.fileSize,
    };
  } catch (error) {
    console.error('Grants sync failed with detailed error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      fileName: syncRecord?.fileName || 'unknown',
      step: 'main_sync_process',
    });

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Update sync record with error if we have one
    if (syncRecord) {
      try {
        await createSyncRecord(
          syncRecord.fileName,
          syncRecord.extractedDate,
          syncRecord.fileSize,
          'failed',
          undefined,
          undefined,
          errorMessage
        );
      } catch (dbError) {
        console.error('Failed to update sync record with error:', dbError);
      }
    }

    return {
      success: false,
      recordsProcessed: 0,
      recordsDeleted: 0,
      errorMessage,
    };
  }
}

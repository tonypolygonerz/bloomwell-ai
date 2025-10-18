// Grants Sync Script - Run directly to sync grants from grants.gov
import { syncGrants } from '../src/lib/grants-sync';

async function main() {
  console.log('🔄 Starting grants sync from grants.gov...');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('');

  try {
    const result = await syncGrants();

    console.log('');
    console.log('✅ SYNC COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════');
    console.log('📊 Sync Results:');
    console.log('   • File Name:', result.fileName || 'N/A');
    console.log('   • File Size:', result.fileSize || 'N/A');
    console.log('   • Extracted Date:', result.extractedDate || 'N/A');
    console.log('   • Records Processed:', result.recordsProcessed);
    console.log('   • Records Deleted:', result.recordsDeleted);
    console.log('   • Success:', result.success);
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('💡 Nonprofit Eligibility Filter:');
    console.log('   ✓ Government-only grants excluded');
    console.log('   ✓ 501(c)(3) eligible grants included');
    console.log('   ✓ Expired grants removed (closeDate < yesterday)');
    console.log('');
    console.log('⏰ Completed at:', new Date().toISOString());

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ SYNC FAILED!');
    console.error('═══════════════════════════════════════════════');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('═══════════════════════════════════════════════');
    process.exit(1);
  }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupExpiredGrants() {
  console.log('🗑️  EXPIRED GRANTS CLEANUP');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  try {
    // First, get counts before cleanup
    const beforeTotal = await prisma.grant.count();
    const beforeActive = await prisma.grant.count({
      where: { closeDate: { gte: new Date() } },
    });
    const beforeExpired = beforeTotal - beforeActive;

    console.log('📊 BEFORE CLEANUP:');
    console.log(`   Total grants: ${beforeTotal.toLocaleString()}`);
    console.log(`   Active grants: ${beforeActive.toLocaleString()}`);
    console.log(`   Expired grants: ${beforeExpired.toLocaleString()}`);
    console.log('');

    // Delete expired grants
    console.log('🔄 Deleting expired grants...');
    console.log(
      `   Removing grants with closeDate < ${new Date().toISOString()}`
    );
    console.log('');

    const deleteResult = await prisma.grant.deleteMany({
      where: {
        AND: [
          { closeDate: { not: null } }, // Has a close date
          { closeDate: { lt: new Date() } }, // And it's in the past
        ],
      },
    });

    console.log(
      `✅ Deleted ${deleteResult.count.toLocaleString()} expired grants`
    );
    console.log('');

    // Get counts after cleanup
    const afterTotal = await prisma.grant.count();
    const afterActive = await prisma.grant.count({
      where: { closeDate: { gte: new Date() } },
    });

    console.log('📊 AFTER CLEANUP:');
    console.log(`   Total grants: ${afterTotal.toLocaleString()}`);
    console.log(`   Active grants: ${afterActive.toLocaleString()}`);
    console.log(
      `   Space saved: ${deleteResult.count.toLocaleString()} records`
    );
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('✅ CLEANUP COMPLETE!');
    console.log('');
    console.log('💡 Benefits:');
    console.log('   ✓ Faster database queries');
    console.log('   ✓ Better user experience');
    console.log('   ✓ Only relevant grants shown');
    console.log('   ✓ Reduced storage usage');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ CLEANUP FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

cleanupExpiredGrants();

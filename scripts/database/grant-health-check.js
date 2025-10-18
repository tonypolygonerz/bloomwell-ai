const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function healthCheck() {
  console.log('🏥 Grant Database Health Check');
  console.log('═══════════════════════════════════════════════');
  console.log('');

  try {
    const total = await prisma.grant.count();
    const active = await prisma.grant.count({
      where: { closeDate: { gte: new Date() } },
    });
    const expired = await prisma.grant.count({
      where: {
        AND: [{ closeDate: { not: null } }, { closeDate: { lt: new Date() } }],
      },
    });
    const noCloseDate = await prisma.grant.count({
      where: { closeDate: null },
    });

    // Grants closing soon (next 30 days)
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    const closingSoon = await prisma.grant.count({
      where: {
        closeDate: {
          gte: new Date(),
          lte: next30Days,
        },
      },
    });

    // Latest sync
    const lastSync = await prisma.grantSync.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    console.log('📊 GRANT STATISTICS:');
    console.log(`   Total Grants: ${total.toLocaleString()}`);
    console.log(
      `   ✅ Active Grants: ${active.toLocaleString()} (${((active / total) * 100).toFixed(1)}%)`
    );
    console.log(
      `   ❌ Expired Grants: ${expired.toLocaleString()} ${expired > 0 ? '⚠️  SHOULD BE ZERO!' : '✓'}`
    );
    console.log(`   📅 No Close Date: ${noCloseDate.toLocaleString()}`);
    console.log(`   ⏰ Closing in 30 days: ${closingSoon.toLocaleString()}`);
    console.log('');

    console.log('🔄 LAST SYNC:');
    console.log(`   Date: ${lastSync?.createdAt || 'Never'}`);
    console.log(`   File: ${lastSync?.fileName || 'N/A'}`);
    console.log(`   Status: ${lastSync?.syncStatus || 'N/A'}`);
    console.log(
      `   Processed: ${lastSync?.recordsProcessed?.toLocaleString() || '0'}`
    );
    console.log(
      `   Deleted: ${lastSync?.recordsDeleted?.toLocaleString() || '0'}`
    );
    console.log('');

    console.log('═══════════════════════════════════════════════');

    if (expired > 0) {
      console.log('⚠️  WARNING: Expired grants found!');
      console.log('   Run: node scripts/cleanup-expired-grants.js');
      console.log('');
    } else if (total === active + noCloseDate) {
      console.log('✅ DATABASE IS CLEAN!');
      console.log('   No expired grants found.');
      console.log('   All grants are current and relevant.');
      console.log('');
    }

    console.log('💡 HEALTH STATUS:');
    if (expired === 0 && active > 500) {
      console.log('   🟢 EXCELLENT - Database optimized, plenty of grants');
    } else if (expired === 0 && active > 100) {
      console.log('   🟡 GOOD - Database clean, consider running sync');
    } else if (expired > 0) {
      console.log('   🔴 NEEDS ATTENTION - Run cleanup script');
    } else {
      console.log('   🟡 FAIR - Consider running sync for more grants');
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

healthCheck();

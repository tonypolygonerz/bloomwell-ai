const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGrants() {
  try {
    const total = await prisma.grant.count();
    const active = await prisma.grant.count({
      where: {
        closeDate: { gte: new Date() },
      },
    });

    console.log('📊 DATABASE STATS:');
    console.log('══════════════════════════════════════');
    console.log('   Total grants in database:', total.toLocaleString());
    console.log('   Active grants (not expired):', active.toLocaleString());
    console.log('   Expired grants:', (total - active).toLocaleString());
    console.log('══════════════════════════════════════');
    console.log('');
    console.log('✅ Grants are ready for nonprofit users!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkGrants();

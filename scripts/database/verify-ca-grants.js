const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyCaGrants() {
  try {
    // Count all CA grants
    const caGrantsCount = await prisma.grant.count({
      where: {
        category: 'California State Grant'
      }
    });

    console.log('\n📊 California Grants Verification Report');
    console.log('='.repeat(60));
    console.log(`Total CA Grants: ${caGrantsCount}`);
    console.log('='.repeat(60));

    // Get sample grants
    const sampleGrants = await prisma.grant.findMany({
      where: {
        category: 'California State Grant'
      },
      select: {
        opportunityId: true,
        title: true,
        agencyCode: true,
        closeDate: true,
        description: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log('\n📋 Sample California Grants (Most Recent 5):');
    console.log('-'.repeat(60));
    
    sampleGrants.forEach((grant, index) => {
      console.log(`\n${index + 1}. ${grant.title}`);
      console.log(`   ID: ${grant.opportunityId}`);
      console.log(`   Agency: ${grant.agencyCode || 'N/A'}`);
      console.log(`   Deadline: ${grant.closeDate ? grant.closeDate.toISOString().split('T')[0] : 'No deadline'}`);
      console.log(`   Description: ${grant.description ? grant.description.substring(0, 150) + '...' : 'N/A'}`);
    });

    // Get total grants in database
    const totalGrants = await prisma.grant.count();
    console.log('\n' + '='.repeat(60));
    console.log(`📈 Total Grants in Database: ${totalGrants}`);
    console.log(`🌴 California Grants: ${caGrantsCount} (${((caGrantsCount/totalGrants) * 100).toFixed(1)}%)`);
    console.log('='.repeat(60));

    // Agency breakdown
    const agencyBreakdown = await prisma.grant.groupBy({
      by: ['agencyCode'],
      where: {
        category: 'California State Grant'
      },
      _count: true,
      orderBy: {
        _count: {
          agencyCode: 'desc'
        }
      },
      take: 10
    });

    console.log('\n🏛️ Top 10 California Agencies:');
    console.log('-'.repeat(60));
    agencyBreakdown.forEach((agency, index) => {
      console.log(`${index + 1}. ${agency.agencyCode || 'General'}: ${agency._count} grants`);
    });

    console.log('\n✅ Verification Complete!\n');

  } catch (error) {
    console.error('Error verifying grants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCaGrants();



const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTrialDates() {
  console.log('🔧 Fixing trial dates for existing users...\n');

  try {
    // Find all users with null trialEndDate
    const usersWithoutEndDate = await prisma.user.findMany({
      where: {
        trialEndDate: null,
        subscriptionStatus: 'TRIAL',
      },
      select: {
        id: true,
        email: true,
        name: true,
        trialStartDate: true,
        createdAt: true,
      },
    });

    console.log(
      `Found ${usersWithoutEndDate.length} users without trial end dates\n`
    );

    if (usersWithoutEndDate.length === 0) {
      console.log('✅ All users already have trial end dates set!');
      return;
    }

    // Update each user
    for (const user of usersWithoutEndDate) {
      const trialStartDate = user.trialStartDate || user.createdAt;
      const trialEndDate = new Date(
        trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          trialEndDate,
          trialStartDate: user.trialStartDate || user.createdAt,
        },
      });

      console.log(
        `✅ Fixed trial dates for: ${user.email || user.name || user.id}`
      );
      console.log(`   Trial Start: ${trialStartDate.toISOString()}`);
      console.log(`   Trial End:   ${trialEndDate.toISOString()}`);
      console.log(
        `   Days Remaining: ${Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24))}\n`
      );
    }

    console.log(
      `\n🎉 Successfully updated ${usersWithoutEndDate.length} users!`
    );
  } catch (error) {
    console.error('❌ Error fixing trial dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixTrialDates().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});




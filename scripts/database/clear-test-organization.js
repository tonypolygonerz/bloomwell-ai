// Clear test organization for fresh testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTestOrganization() {
  try {
    console.log('🔍 Checking for test organization...');
    
    // Find the test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@bloomwell.ai' },
      include: { Organization: true }
    });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    
    if (user.Organization) {
      console.log(`📋 Organization found:`);
      console.log(`   - Name: ${user.Organization.name}`);
      console.log(`   - Mission: ${user.Organization.mission}`);
      console.log(`   - State: ${user.Organization.state}`);
      console.log(`   - Focus Areas: ${user.Organization.focusAreas}`);
      
      // Remove organization link from user
      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: null }
      });
      
      // Delete the organization
      await prisma.organization.delete({
        where: { id: user.Organization.id }
      });
      
      // Delete onboarding progress
      await prisma.onboardingProgress.deleteMany({
        where: { userId: user.id }
      });
      
      console.log('✅ Organization deleted successfully!');
      console.log('✅ Onboarding progress cleared!');
      console.log('🎉 User is now ready for fresh first-time flow!');
    } else {
      console.log('ℹ️  No organization found - user already fresh!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestOrganization();


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('test1234', 10);

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        id: 'test-org-' + Date.now(),
        name: 'Test Nonprofit Organization',
        mission: 'To test the progressive onboarding feature',
        organizationType: '501c3',
        state: 'California',
        focusAreas: 'Community Development, Education',
        budget: 'under_100k',
        staffSize: '5',
        profileCompleteness: 0,
        updatedAt: new Date(),
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        id: 'test-user-' + Date.now(),
        email: 'test@bloomwell.ai',
        password: hashedPassword,
        name: 'Test User',
        organizationId: organization.id,
        subscriptionStatus: 'TRIAL',
        trialStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        updatedAt: new Date(),
      },
    });

    // Create onboarding progress
    await prisma.onboardingProgress.create({
      data: {
        id: 'progress-' + Date.now(),
        userId: user.id,
        completedSections: [],
        sectionScores: {},
        overallScore: 0,
      },
    });

    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('📧 Email: test@bloomwell.ai');
    console.log('🔑 Password: test1234');
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/auth/login');
    console.log('');
    console.log('Organization:', organization.name);
    console.log('Profile Completeness: 0%');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();


/**
 * Seed Script: Initialize Maintenance Mode Records
 *
 * Creates default maintenance mode records for production and staging environments
 * Run this script after migration: node scripts/seed-maintenance-mode.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Seeding Maintenance Mode Records...\n');

  try {
    // Seed Production Environment
    console.log('Creating production maintenance mode record...');
    const production = await prisma.maintenanceMode.upsert({
      where: { environment: 'production' },
      update: {
        // Don't change existing settings on reseed
      },
      create: {
        environment: 'production',
        isEnabled: false,
        message: null,
        enabledAt: null,
        enabledBy: null,
      },
    });

    console.log('✅ Production:', {
      environment: production.environment,
      isEnabled: production.isEnabled,
    });

    // Seed Staging Environment
    console.log('\nCreating staging maintenance mode record...');
    const staging = await prisma.maintenanceMode.upsert({
      where: { environment: 'staging' },
      update: {
        // Don't change existing settings on reseed
      },
      create: {
        environment: 'staging',
        isEnabled: false,
        message: null,
        enabledAt: null,
        enabledBy: null,
      },
    });

    console.log('✅ Staging:', {
      environment: staging.environment,
      isEnabled: staging.isEnabled,
    });

    console.log('\n✨ Maintenance Mode seeding complete!');
    console.log('\n📊 Summary:');
    console.log('   - Production: Maintenance mode DISABLED (default)');
    console.log('   - Staging: Maintenance mode DISABLED (default)');
    console.log('\n💡 Tip: Visit /admin/maintenance to manage these settings');
  } catch (error) {
    console.error('❌ Error seeding maintenance mode:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


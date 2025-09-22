const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin user and sample data...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'super_admin'
    }
  })

  console.log('✅ Admin user created:', adminUser.username)

  // Create sample webinars
  const sampleWebinars = [
    {
      title: 'Grant Writing Fundamentals for Nonprofits',
      description: 'Learn the essential skills and strategies for successful grant writing. This comprehensive webinar covers everything from finding the right grants to crafting compelling proposals that get funded.\n\nTopics covered:\n- Researching and identifying grant opportunities\n- Understanding grant requirements and guidelines\n- Writing compelling narratives and budgets\n- Common mistakes to avoid\n- Follow-up and reporting best practices',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      timezone: 'America/Los_Angeles',
      duration: 90,
      thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      uniqueSlug: 'grant-writing-fundamentals-' + Date.now(),
      slug: 'grant-writing-fundamentals',
      status: 'published',
      createdBy: adminUser.id
    },
    {
      title: 'Board Governance Best Practices',
      description: 'Essential governance principles and practices for nonprofit boards. Learn how to build an effective board that supports your organization\'s mission and ensures compliance with legal requirements.\n\nKey topics:\n- Board roles and responsibilities\n- Effective board meetings and decision-making\n- Financial oversight and accountability\n- Legal compliance and risk management\n- Board recruitment and development',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      timezone: 'America/Los_Angeles',
      duration: 75,
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop',
      uniqueSlug: 'board-governance-best-practices-' + Date.now(),
      slug: 'board-governance-best-practices',
      status: 'published',
      createdBy: adminUser.id
    },
    {
      title: 'Digital Marketing for Nonprofits',
      description: 'Discover how to leverage digital marketing tools and strategies to increase your nonprofit\'s visibility, engage supporters, and drive donations. Perfect for organizations looking to expand their online presence.\n\nWhat you\'ll learn:\n- Social media strategy and content planning\n- Email marketing best practices\n- Website optimization for conversions\n- Online fundraising campaigns\n- Measuring and analyzing your impact',
      scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      timezone: 'America/Los_Angeles',
      duration: 60,
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      uniqueSlug: 'digital-marketing-nonprofits-' + Date.now(),
      slug: 'digital-marketing-nonprofits',
      status: 'draft',
      createdBy: adminUser.id
    }
  ]

  for (const webinarData of sampleWebinars) {
    const webinar = await prisma.webinar.upsert({
      where: { uniqueSlug: webinarData.uniqueSlug },
      update: {},
      create: webinarData
    })
    console.log('✅ Sample webinar created:', webinar.title)
  }

  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test webinars...');

  // Get or create admin user
  let adminUser = await prisma.adminUser.findFirst({
    where: { role: 'super_admin' },
  });

  if (!adminUser) {
    console.log('No admin user found, creating one...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'super_admin',
      },
    });
  }

  console.log('✅ Using admin user:', adminUser.username);

  // Calculate dates for the next 2-4 weeks
  const today = new Date();
  const getDateDaysFromNow = days => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    // Set to 2 PM Pacific time
    date.setHours(14, 0, 0, 0);
    return date;
  };

  // Create 5 test webinars with diverse topics and dates
  const sampleWebinars = [
    {
      id: 'webinar-1-' + Date.now(),
      title: 'Grant Writing Fundamentals for Nonprofits',
      description:
        'Learn the essential skills and strategies for successful grant writing. This comprehensive webinar covers everything from finding the right grants to crafting compelling proposals that get funded.\n\nTopics covered:\n- Researching and identifying grant opportunities\n- Understanding grant requirements and guidelines\n- Writing compelling narratives and budgets\n- Common mistakes to avoid\n- Follow-up and reporting best practices',
      scheduledDate: getDateDaysFromNow(5), // 5 days from now
      timezone: 'America/Los_Angeles',
      duration: 90,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      uniqueSlug: 'grant-writing-fundamentals-' + Date.now(),
      slug: 'grant-writing-fundamentals',
      status: 'published',
      isPublished: true,
      maxAttendees: 100,
      categories: JSON.stringify(['Grant Writing', 'Fundraising']),
      guestSpeakers: JSON.stringify([
        {
          honorific: 'Dr.',
          firstName: 'Sarah',
          lastName: 'Johnson',
          title: 'Grant Writing Expert',
          institution: 'National Grant Institute',
          email: 'sarah.johnson@example.com',
          bio: 'Dr. Johnson has over 15 years of experience in grant writing and has helped nonprofits secure over $50M in funding.',
        },
      ]),
      materials: JSON.stringify([]),
      metaDescription:
        'Join our expert-led webinar on grant writing fundamentals for nonprofits. Learn how to find and win grants.',
      createdBy: adminUser.id,
      updatedAt: new Date(),
    },
    {
      id: 'webinar-2-' + Date.now(),
      title: 'Board Governance and Effective Leadership',
      description:
        "Essential governance principles and practices for nonprofit boards. Learn how to build an effective board that supports your organization's mission and ensures compliance with legal requirements.\n\nKey topics:\n- Board roles and responsibilities\n- Effective board meetings and decision-making\n- Financial oversight and accountability\n- Legal compliance and risk management\n- Board recruitment and development",
      scheduledDate: getDateDaysFromNow(10), // 10 days from now
      timezone: 'America/Los_Angeles',
      duration: 75,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
      uniqueSlug: 'board-governance-leadership-' + Date.now(),
      slug: 'board-governance-leadership',
      status: 'published',
      isPublished: true,
      maxAttendees: 100,
      categories: JSON.stringify(['Board Governance', 'Strategic Planning']),
      guestSpeakers: JSON.stringify([
        {
          honorific: 'Ms.',
          firstName: 'Jennifer',
          lastName: 'Martinez',
          title: 'Nonprofit Governance Consultant',
          institution: 'BoardSource',
          email: 'jennifer.martinez@example.com',
          bio: 'Jennifer specializes in helping nonprofit boards achieve excellence through effective governance practices.',
        },
      ]),
      materials: JSON.stringify([]),
      metaDescription:
        'Discover best practices for nonprofit board governance and leadership in this comprehensive webinar.',
      createdBy: adminUser.id,
      updatedAt: new Date(),
    },
    {
      id: 'webinar-3-' + Date.now(),
      title: 'Digital Marketing Strategies for Nonprofits',
      description:
        "Discover how to leverage digital marketing tools and strategies to increase your nonprofit's visibility, engage supporters, and drive donations. Perfect for organizations looking to expand their online presence.\n\nWhat you'll learn:\n- Social media strategy and content planning\n- Email marketing best practices\n- Website optimization for conversions\n- Online fundraising campaigns\n- Measuring and analyzing your impact",
      scheduledDate: getDateDaysFromNow(14), // 2 weeks from now
      timezone: 'America/Los_Angeles',
      duration: 60,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      uniqueSlug: 'digital-marketing-nonprofits-' + Date.now(),
      slug: 'digital-marketing-nonprofits',
      status: 'published',
      isPublished: true,
      maxAttendees: 100,
      categories: JSON.stringify(['Marketing', 'Technology']),
      guestSpeakers: JSON.stringify([
        {
          honorific: 'Mr.',
          firstName: 'Michael',
          lastName: 'Chen',
          title: 'Digital Marketing Director',
          institution: 'Nonprofit Tech Alliance',
          email: 'michael.chen@example.com',
          bio: 'Michael has helped over 200 nonprofits build successful digital marketing strategies.',
        },
      ]),
      materials: JSON.stringify([]),
      metaDescription:
        'Learn effective digital marketing strategies to grow your nonprofit online presence and engagement.',
      createdBy: adminUser.id,
      updatedAt: new Date(),
    },
    {
      id: 'webinar-4-' + Date.now(),
      title: 'Financial Management for Small Nonprofits',
      description:
        'Master the fundamentals of nonprofit financial management. This webinar is designed for executive directors, board treasurers, and finance staff of small to mid-sized nonprofits.\n\nTopics include:\n- Creating and managing budgets\n- Financial reporting and statements\n- Internal controls and fraud prevention\n- Cash flow management\n- Audit preparation and compliance',
      scheduledDate: getDateDaysFromNow(18), // 18 days from now
      timezone: 'America/Los_Angeles',
      duration: 90,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
      uniqueSlug: 'financial-management-nonprofits-' + Date.now(),
      slug: 'financial-management-nonprofits',
      status: 'published',
      isPublished: true,
      maxAttendees: 100,
      categories: JSON.stringify(['Operations', 'Board Governance']),
      guestSpeakers: JSON.stringify([
        {
          honorific: 'Ms.',
          firstName: 'Patricia',
          lastName: 'Williams',
          title: 'Nonprofit Financial Advisor',
          institution: 'CPA Nonprofit Services',
          email: 'patricia.williams@example.com',
          bio: 'Patricia is a CPA with 20 years of experience specializing in nonprofit financial management.',
        },
      ]),
      materials: JSON.stringify([]),
      metaDescription:
        'Essential financial management strategies for small nonprofit organizations and their boards.',
      createdBy: adminUser.id,
      updatedAt: new Date(),
    },
    {
      id: 'webinar-5-' + Date.now(),
      title: 'Volunteer Recruitment and Engagement',
      description:
        'Build a thriving volunteer program that attracts, retains, and motivates passionate supporters. Learn proven strategies for volunteer recruitment, onboarding, and recognition.\n\nSession highlights:\n- Creating compelling volunteer opportunities\n- Effective recruitment strategies\n- Volunteer onboarding and training\n- Building a culture of appreciation\n- Measuring volunteer impact\n- Technology tools for volunteer management',
      scheduledDate: getDateDaysFromNow(24), // 24 days from now
      timezone: 'America/Los_Angeles',
      duration: 75,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
      uniqueSlug: 'volunteer-recruitment-engagement-' + Date.now(),
      slug: 'volunteer-recruitment-engagement',
      status: 'published',
      isPublished: true,
      maxAttendees: 100,
      categories: JSON.stringify(['Operations', 'Strategic Planning']),
      guestSpeakers: JSON.stringify([
        {
          honorific: 'Dr.',
          firstName: 'Robert',
          lastName: 'Taylor',
          title: 'Volunteer Management Specialist',
          institution: 'VolunteerHub',
          email: 'robert.taylor@example.com',
          bio: 'Dr. Taylor has trained thousands of nonprofit leaders on volunteer program excellence.',
        },
      ]),
      materials: JSON.stringify([]),
      metaDescription:
        'Learn how to build and manage a successful volunteer program for your nonprofit organization.',
      createdBy: adminUser.id,
      updatedAt: new Date(),
    },
  ];

  // Delete existing test webinars to avoid duplicates
  console.log('🗑️  Removing old test webinars...');
  await prisma.webinar.deleteMany({
    where: {
      slug: {
        in: sampleWebinars.map(w => w.slug),
      },
    },
  });

  // Create new webinars
  for (const webinarData of sampleWebinars) {
    const webinar = await prisma.webinar.create({
      data: webinarData,
    });
    console.log(
      `✅ Created webinar: ${webinar.title} (${webinar.scheduledDate.toLocaleDateString()})`
    );
  }

  console.log('🎉 Seeding completed successfully!');
  console.log(
    `📅 Created ${sampleWebinars.length} webinars spanning the next 2-4 weeks`
  );
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


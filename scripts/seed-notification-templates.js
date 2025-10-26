const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const templates = [
  {
    name: "Webinar Reminder - 24 Hours",
    subject: "Webinar Reminder: {webinar_title}",
    content:
      'Don\'t forget! Your webinar "{webinar_title}" is tomorrow at {webinar_time}. We look forward to seeing you there!',
    type: "webinar_reminder",
  },
  {
    name: "Webinar Starting Soon - 1 Hour",
    subject: "Webinar Starting Soon: {webinar_title}",
    content: 'Your webinar "{webinar_title}" starts in 1 hour! Get ready to join the session.',
    type: "webinar_reminder",
  },
  {
    name: "Webinar Starting Now",
    subject: "Webinar Starting Now: {webinar_title}",
    content: 'Your webinar "{webinar_title}" is starting now! Join the session to participate.',
    type: "webinar_starting",
  },
  {
    name: "Webinar Follow-up",
    subject: "Thank you for attending: {webinar_title}",
    content:
      'Thank you for attending "{webinar_title}". The recording will be available soon. We hope you found it valuable!',
    type: "webinar_followup",
  },
  {
    name: "General Announcement",
    subject: "Important Update: {announcement_title}",
    content: "{announcement_content}",
    type: "announcement",
  },
  {
    name: "New Feature Announcement",
    subject: "New Feature Available: {feature_name}",
    content: "We're excited to announce a new feature: {feature_name}. {feature_description}",
    type: "announcement",
  },
]

async function seedTemplates() {
  try {
    console.log("Seeding notification templates...")

    // Clear existing templates first
    await prisma.notificationTemplate.deleteMany({})

    // Create new templates
    await prisma.notificationTemplate.createMany({
      data: templates,
    })

    console.log("✅ Notification templates seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding notification templates:", error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTemplates()

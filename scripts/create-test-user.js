const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating test user...')

  // Hash the password
  const hashedPassword = await bcrypt.hash('testpassword123', 10)

  // Create or update test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@bloomwellai.com' },
    update: {
      password: hashedPassword,
      name: 'Test User',
    },
    create: {
      email: 'test@bloomwellai.com',
      password: hashedPassword,
      name: 'Test User',
    },
  })

  console.log('✅ Test user created successfully!')
  console.log('')
  console.log('=================================')
  console.log('TEST LOGIN CREDENTIALS:')
  console.log('=================================')
  console.log('Email:    test@bloomwellai.com')
  console.log('Password: testpassword123')
  console.log('=================================')
  console.log('')
  console.log('You can now login at: http://localhost:3000/auth/login')
}

main()
  .catch((e) => {
    console.error('Error creating test user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


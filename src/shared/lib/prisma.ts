import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Ensure connection is established immediately
if (!globalForPrisma.prisma) {
  // Connect synchronously in development to avoid timing issues
  prisma
    .$connect()
    .then(() => {
      console.log('✅ Prisma connected successfully');
    })
    .catch(err => {
      console.error('❌ Failed to connect to database:', err);
      console.error('Database URL:', process.env.DATABASE_URL);
    });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

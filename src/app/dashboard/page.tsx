import { getServerSession } from 'next-auth';
import { prisma } from '@/shared/lib/prisma';
import { redirect } from 'next/navigation';
import AppLayout from '@/shared/components/layout/AppLayout';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Ensure Prisma is connected before making queries
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    redirect('/auth/login');
  }

  // Check if user has an organization
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || '' },
    include: { Organization: true },
  });

  if (!user?.organizationId) {
    redirect('/onboarding/organization');
  }

  return (
    <AppLayout>
      <DashboardClient 
        userName={session.user?.name || 'User'} 
        userId={session.user?.id || ''} 
      />
    </AppLayout>
  );
}

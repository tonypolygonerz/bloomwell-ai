import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';
import { getAdminFromRequest } from '@/shared/lib/admin-auth';

interface UserEngagementData {
  category: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalConversations: number;
}

interface WebinarData {
  category: string;
  totalWebinars: number;
  totalRegistrations: number;
  uniqueAttendees: number;
  avgRegistrationsPerWebinar: number;
}

interface RevenueData {
  category: string;
  paidUsers: number;
  trialUsers: number;
  totalUsers: number;
}

interface DailyMetricsData {
  date: string;
  dailyActiveUsers: number;
  dailyConversations: number;
  dailyWebinarRegistrations: number;
}

type AnalyticsData = UserEngagementData | WebinarData | RevenueData | DailyMetricsData;

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get comprehensive analytics data
    const [userEngagementData, webinarData, revenueData, dailyMetrics] =
      (await Promise.all([
        // User engagement metrics
        prisma.$queryRaw`
        SELECT
          'User Engagement' as category,
          COUNT(DISTINCT u.id) as totalUsers,
          COUNT(DISTINCT CASE WHEN c.createdAt >= ${start} THEN c.userId END) as activeUsers,
          COUNT(DISTINCT CASE WHEN u.createdAt >= ${start} THEN u.id END) as newUsers,
          COUNT(c.id) as totalConversations
        FROM User u
        LEFT JOIN Conversation c ON u.id = c.userId AND c.createdAt >= ${start} AND c.createdAt <= ${end}
      `,

        // Webinar metrics
        prisma.$queryRaw`
        SELECT
          'Webinar Performance' as category,
          COUNT(DISTINCT w.id) as totalWebinars,
          COUNT(DISTINCT r.id) as totalRegistrations,
          COUNT(DISTINCT r.userId) as uniqueAttendees,
          AVG(CAST(r.id AS FLOAT)) as avgRegistrationsPerWebinar
        FROM Webinar w
        LEFT JOIN WebinarRSVP r ON w.id = r.webinarId AND r.rsvpDate >= ${start} AND r.rsvpDate <= ${end}
        WHERE w.createdAt >= ${start} AND w.createdAt <= ${end}
      `,

        // Revenue metrics
        prisma.$queryRaw`
        SELECT
          'Revenue Metrics' as category,
          COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN u.id END) as paidUsers,
          COUNT(DISTINCT CASE WHEN a.id IS NULL THEN u.id END) as trialUsers,
          COUNT(DISTINCT u.id) as totalUsers
        FROM User u
        LEFT JOIN Account a ON u.id = a.userId
        WHERE u.createdAt >= ${start} AND u.createdAt <= ${end}
      `,

        // Daily metrics
        prisma.$queryRaw`
        SELECT
          DATE(c.createdAt) as date,
          COUNT(DISTINCT c.userId) as dailyActiveUsers,
          COUNT(c.id) as dailyConversations,
          COUNT(DISTINCT r.userId) as dailyWebinarRegistrations
        FROM Conversation c
        LEFT JOIN WebinarRSVP r ON DATE(r.rsvpDate) = DATE(c.createdAt)
        WHERE c.createdAt >= ${start} AND c.createdAt <= ${end}
        GROUP BY DATE(c.createdAt)
        ORDER BY date
      `,
      ])) as AnalyticsData[];

    // Generate CSV content
    const csvRows = [];

    // Add summary metrics
    csvRows.push(['Category', 'Metric', 'Value']);
    csvRows.push(['', '', '']);

    // User engagement
    csvRows.push([
      'User Engagement',
      'Total Users',
      (userEngagementData as any[])![0]?.totalUsers || 0,
    ]);
    csvRows.push([
      'User Engagement',
      'Active Users',
      (userEngagementData as any[])![0]?.activeUsers || 0,
    ]);
    csvRows.push([
      'User Engagement',
      'New Users',
      (userEngagementData as any[])![0]?.newUsers || 0,
    ]);
    csvRows.push([
      'User Engagement',
      'Total Conversations',
      (userEngagementData as any[])![0]?.totalConversations || 0,
    ]);
    csvRows.push(['', '', '']);

    // Webinar metrics
    csvRows.push([
      'Webinar Performance',
      'Total Webinars',
      (webinarData as any[])![0]?.totalWebinars || 0,
    ]);
    csvRows.push([
      'Webinar Performance',
      'Total Registrations',
      (webinarData as any[])![0]?.totalRegistrations || 0,
    ]);
    csvRows.push([
      'Webinar Performance',
      'Unique Attendees',
      (webinarData as any[])![0]?.uniqueAttendees || 0,
    ]);
    csvRows.push([
      'Webinar Performance',
      'Avg Registrations/Webinar',
      Math.round(((webinarData as any[])![0]?.avgRegistrationsPerWebinar || 0) * 100) / 100,
    ]);
    csvRows.push(['', '', '']);

    // Revenue metrics
    csvRows.push([
      'Revenue Metrics',
      'Paid Users',
      (revenueData as any[])![0]?.paidUsers || 0,
    ]);
    csvRows.push([
      'Revenue Metrics',
      'Trial Users',
      (revenueData as any[])![0]?.trialUsers || 0,
    ]);
    csvRows.push([
      'Revenue Metrics',
      'Total Users',
      (revenueData as any[])![0]?.totalUsers || 0,
    ]);
    csvRows.push([
      'Revenue Metrics',
      'Conversion Rate',
      (revenueData as any[])![0]?.totalUsers > 0
        ? Math.round(
            ((revenueData as any[])![0]?.paidUsers || 0) / (revenueData as any[])![0]?.totalUsers *
              10000
          ) / 100
        : 0,
    ]);
    csvRows.push(['', '', '']);

    // Daily metrics
    csvRows.push([
      'Date',
      'Daily Active Users',
      'Daily Conversations',
      'Daily Webinar Registrations',
    ]);
    (dailyMetrics as any[]).forEach((day: DailyMetricsData) => {
      csvRows.push([
        day.date,
        day.dailyActiveUsers || 0,
        day.dailyConversations || 0,
        day.dailyWebinarRegistrations || 0,
      ]);
    });

    const csvContent = csvRows
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Analytics export API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export analytics data',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

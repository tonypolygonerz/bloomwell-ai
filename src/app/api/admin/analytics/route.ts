import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAdminFromRequest } from '@/lib/admin-auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // User Engagement Metrics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalConversations,
      totalMessages,
      avgSessionsPerUser,
      userEngagementData,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (users with conversations or RSVPs in period)
      prisma.user.count({
        where: {
          OR: [
            {
              conversations: {
                some: {
                  createdAt: { gte: start, lte: end },
                },
              },
            },
            {
              webinarRSVPs: {
                some: {
                  rsvpDate: { gte: start, lte: end },
                },
              },
            },
          ],
        },
      }),

      // New users in period
      prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),

      // Total conversations
      prisma.conversation.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),

      // Total messages (approximate from conversations)
      prisma.conversation.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),

      // Average sessions per user
      prisma.conversation
        .groupBy({
          by: ['userId'],
          where: {
            createdAt: { gte: start, lte: end },
          },
          _count: {
            id: true,
          },
        })
        .then(results => {
          const totalSessions = results.reduce(
            (sum, result) => sum + result._count.id,
            0
          );
          return results.length > 0 ? totalSessions / results.length : 0;
        }),

      // Daily user engagement data
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(DISTINCT userId) as activeUsers,
          COUNT(*) as conversations
        FROM Conversation 
        WHERE createdAt >= ${start} AND createdAt <= ${end}
        GROUP BY DATE(createdAt)
        ORDER BY date
      `,
    ]);

    // Webinar Analytics
    const [
      totalWebinars,
      totalRegistrations,
      totalAttendees,
      webinarEngagementData,
      popularTopics,
    ] = await Promise.all([
      // Total webinars in period
      prisma.webinar.count({
        where: {
          createdAt: { gte: start, lte: end },
        },
      }),

      // Total registrations
      prisma.webinarRSVP.count({
        where: {
          rsvpDate: { gte: start, lte: end },
        },
      }),

      // Total attendees (assuming all RSVPs are attendees for now)
      prisma.webinarRSVP.count({
        where: {
          rsvpDate: { gte: start, lte: end },
        },
      }),

      // Webinar engagement over time
      prisma.$queryRaw`
        SELECT 
          DATE(w.createdAt) as date,
          COUNT(w.id) as webinarsCreated,
          COUNT(r.id) as registrations
        FROM Webinar w
        LEFT JOIN WebinarRSVP r ON w.id = r.webinarId
        WHERE w.createdAt >= ${start} AND w.createdAt <= ${end}
        GROUP BY DATE(w.createdAt)
        ORDER BY date
      `,

      // Popular webinar topics (by title keywords)
      prisma.webinar.findMany({
        where: {
          createdAt: { gte: start, lte: end },
        },
        select: {
          title: true,
          _count: {
            select: {
              rsvps: true,
            },
          },
        },
        orderBy: {
          rsvps: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Revenue and Subscription Metrics
    const [totalRevenue, subscriptionBreakdown, churnData, conversionTimeline] =
      await Promise.all([
        // Total revenue (mock calculation - would need actual payment data)
        prisma.user
          .count({
            where: {
              accounts: {
                some: {},
              },
            },
          })
          .then(oauthUsers => oauthUsers * 20.99), // Assuming OAuth users are paid

        // Subscription breakdown
        prisma.user
          .groupBy({
            by: ['id'],
            where: {
              createdAt: { gte: start, lte: end },
            },
            _count: {
              accounts: true,
            },
          })
          .then(results => {
            const oauthUsers = results.filter(
              r => r._count.accounts > 0
            ).length;
            const emailUsers = results.filter(
              r => r._count.accounts === 0
            ).length;
            return {
              trial: emailUsers,
              paid: oauthUsers,
              conversionRate:
                emailUsers > 0 ? (oauthUsers / emailUsers) * 100 : 0,
            };
          }),

        // Churn data (users who haven't been active)
        prisma.user.count({
          where: {
            AND: [
              { createdAt: { lt: start } },
              {
                conversations: {
                  none: {
                    createdAt: { gte: start },
                  },
                },
              },
              {
                webinarRSVPs: {
                  none: {
                    rsvpDate: { gte: start },
                  },
                },
              },
            ],
          },
        }),

        // Conversion timeline (new users over time)
        prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as newUsers,
          COUNT(CASE WHEN id IN (
            SELECT DISTINCT userId FROM Account
          ) THEN 1 END) as convertedUsers
        FROM User
        WHERE createdAt >= ${start} AND createdAt <= ${end}
        GROUP BY DATE(createdAt)
        ORDER BY date
      `,
      ]);

    // Calculate KPIs
    const kpis = {
      userEngagement: {
        totalUsers,
        activeUsers,
        newUsers,
        activeUserRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        avgSessionsPerUser: Math.round(avgSessionsPerUser * 100) / 100,
        totalConversations,
        totalMessages,
      },
      webinarMetrics: {
        totalWebinars,
        totalRegistrations,
        totalAttendees,
        registrationRate:
          totalWebinars > 0 ? totalRegistrations / totalWebinars : 0,
        attendanceRate:
          totalRegistrations > 0
            ? (totalAttendees / totalRegistrations) * 100
            : 0,
      },
      revenueMetrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        mrr: Math.round((totalRevenue / parseInt(period)) * 30 * 100) / 100, // Approximate MRR
        ...subscriptionBreakdown,
        churnRate: totalUsers > 0 ? (churnData / totalUsers) * 100 : 0,
      },
    };

    return NextResponse.json({
      kpis,
      timeSeriesData: {
        userEngagement: userEngagementData,
        webinarEngagement: webinarEngagementData,
        conversionTimeline: conversionTimeline,
      },
      insights: {
        popularTopics,
        topPerformingWebinars: popularTopics.slice(0, 5),
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: parseInt(period),
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

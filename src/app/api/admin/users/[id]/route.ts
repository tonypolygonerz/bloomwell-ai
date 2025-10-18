import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;

    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Organization: true,
        Account: {
          select: {
            provider: true,
            type: true,
          },
        },
        Conversation: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                Message: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        WebinarRSVP: {
          include: {
            Webinar: {
              select: {
                id: true,
                title: true,
                scheduledDate: true,
                status: true,
              },
            },
          },
          orderBy: {
            rsvpDate: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            Conversation: true,
            WebinarRSVP: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform data for frontend
    const transformedUser = {
      id: user.id,
      name: user.name || 'No name',
      email: user.email,
      image: user.image,
      organization: user.Organization
        ? {
            id: user.Organization.id,
            name: user.Organization.name,
            mission: user.Organization.mission,
            budget: user.Organization.budget,
            staffSize: user.Organization.staffSize,
            focusAreas: user.Organization.focusAreas,
          }
        : null,
      accountType: user.Account.length > 0 ? user.Account[0].provider : 'email',
      lastLogin: user.updatedAt, // Using updatedAt as proxy
      createdAt: user.createdAt,
      status: 'active', // All users are active for now
      conversationCount: user._count.Conversation,
      rsvpCount: user._count.WebinarRSVP,
      lastConversation: user.Conversation[0]?.createdAt || null,
      lastRSVP: user.WebinarRSVP[0]?.rsvpDate || null,
    };

    // Transform conversations
    const transformedConversations = user.Conversation.map((conv: any) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      messageCount: conv._count.Message,
    }));

    // Transform RSVPs
    const transformedRSVPs = user.WebinarRSVP.map((rsvp: any) => ({
      id: rsvp.id,
      webinar: rsvp.Webinar,
      rsvpDate: rsvp.rsvpDate,
      attended: rsvp.attended,
    }));

    return NextResponse.json({
      user: transformedUser,
      conversations: transformedConversations,
      rsvps: transformedRSVPs,
    });
  } catch (error) {
    console.error('User detail API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user details',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

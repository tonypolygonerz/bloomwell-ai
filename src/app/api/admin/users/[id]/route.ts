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
        organization: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
        conversations: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        rsvps: {
          include: {
            webinar: {
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
            conversations: true,
            rsvps: true,
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
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            mission: user.organization.mission,
            budget: user.organization.budget,
            staffSize: user.organization.staffSize,
            focusAreas: user.organization.focusAreas,
          }
        : null,
      accountType:
        user.accounts.length > 0 ? user.accounts[0].provider : 'email',
      lastLogin: user.updatedAt, // Using updatedAt as proxy
      createdAt: user.createdAt,
      status: 'active', // All users are active for now
      conversationCount: user._count.conversations,
      rsvpCount: user._count.rsvps,
      lastConversation: user.conversations[0]?.createdAt || null,
      lastRSVP: user.rsvps[0]?.rsvpDate || null,
    };

    // Transform conversations
    const transformedConversations = user.conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      messageCount: conv._count.messages,
    }));

    // Transform RSVPs
    const transformedRSVPs = user.rsvps.map(rsvp => ({
      id: rsvp.id,
      webinar: rsvp.webinar,
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

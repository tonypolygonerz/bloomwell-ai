import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - Fetch all conversations for the user
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        Conversation: {
          orderBy: { updatedAt: 'desc' },
          include: {
            Message: {
              orderBy: { createdAt: 'asc' },
              take: 1, // Get first message for preview
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ conversations: user.Conversation });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log(
      'POST /api/conversations - Session:',
      session?.user?.email ? 'Authenticated' : 'Not authenticated'
    );

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { Organization: true },
    });

    console.log(
      'POST /api/conversations - User found:',
      !!user,
      'Organization:',
      !!user?.Organization
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(
      'POST /api/conversations - Creating conversation with ID:',
      conversationId
    );

    const conversation = await prisma.conversation.create({
      data: {
        id: conversationId,
        title: title || 'New Conversation',
        userId: user.id,
        organizationId: user.Organization?.id,
        updatedAt: new Date(),
      },
    });

    console.log(
      'POST /api/conversations - Conversation created successfully:',
      conversation.id
    );
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

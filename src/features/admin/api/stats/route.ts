import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/features/auth/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    // For now, return mock stats since we have sample data
    const stats = {
      totalWebinars: 3,
      publishedWebinars: 2,
      totalRSVPs: 0,
      upcomingWebinars: 2,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

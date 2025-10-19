import { NextRequest, NextResponse } from 'next/server';

// Redirect to cloud API - this maintains backward compatibility
export async function POST(request: NextRequest) {
  try {
    // Forward the request to the cloud API
    const cloudApiUrl = new URL('/api/chat/cloud', request.url);

    const response = await fetch(cloudApiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('authorization') || '',
        Cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify(await request.json()),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Chat API redirect error:', error);
    return NextResponse.json(
      {
        error:
          'AI service temporarily unavailable. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}

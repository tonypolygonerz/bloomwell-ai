import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint for error reporting
 * POST /api/errors
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error, errorInfo, timestamp, userAgent, url } = body

    // In production, send to error tracking service (e.g., Sentry, LogRocket, Rollbar)
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error Reported:', {
        error,
        errorInfo,
        timestamp,
        userAgent,
        url,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      })
    }

    // Example with Sentry:
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(new Error(error.message), {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //     tags: {
    //       errorBoundary: true,
    //     },
    //     extra: {
    //       url,
    //       userAgent,
    //       timestamp,
    //     },
    //   })
    // }

    // Store in database for analysis
    // await db.errorLogs.create({
    //   message: error.message,
    //   stack: error.stack,
    //   componentStack: errorInfo.componentStack,
    //   url,
    //   userAgent,
    //   timestamp,
    // })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Error reporting failed:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}


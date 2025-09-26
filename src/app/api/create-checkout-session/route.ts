import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';

// Debug logging for environment variables
console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('App URL exists:', !!process.env.NEXT_PUBLIC_APP_URL);

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== Stripe Checkout API Called ===');

    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing');
      return NextResponse.json(
        { error: 'Stripe configuration missing' },
        { status: 500 }
      );
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log('No authenticated session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, planType } = await request.json();
    console.log('Request data:', {
      priceId,
      planType,
      userEmail: session.user.email,
    });

    if (!priceId || !planType) {
      console.log('Missing required fields:', { priceId, planType });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Creating Stripe checkout session...');
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${planType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userEmail: session.user.email,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userEmail: session.user.email,
          planType: planType,
        },
      },
    });

    console.log('Checkout session created:', checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

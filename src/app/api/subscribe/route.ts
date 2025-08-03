// ✅ src/app/api/subscribe/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripeInstance } from '@/lib/stripe'; // ✅ Import safe runtime Stripe loader

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id || !session.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { creatorId, plan, amount } = await req.json();

  if (!creatorId || !plan || typeof amount !== 'number') {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const stripe = getStripeInstance(); // ✅ Runtime-safe Stripe usage

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan} Subscription to Creator #${creatorId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        creatorId: String(creatorId),
        userId: String(session.user.id),
        type: plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/creator/${session.user.name}?subscribed=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/creator/${session.user.name}?canceled=1`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

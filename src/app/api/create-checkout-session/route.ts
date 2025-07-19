import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // ✅ Updated to match Stripe types
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    console.error('❌ Unauthorized: no session found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { creatorId, type, postId, amount } = await req.json();

  if (!creatorId || !type || (type === 'post' && (!postId || !amount))) {
    console.error('❌ Missing required parameters');
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({
    where: { id: creatorId },
  });

  if (!creator || !creator.stripeAccountId) {
    console.error('❌ Creator not found or missing Stripe account');
    return NextResponse.json({ error: 'Creator not eligible for payments' }, { status: 400 });
  }

  const isSubscription = type === 'weekly' || type === 'monthly';
  const priceId = type === 'weekly' ? creator.weeklyPriceId : creator.monthlyPriceId;

  if (isSubscription && !priceId) {
    console.error('❌ Missing Stripe price ID for creator’s subscription:', type);
    return NextResponse.json({ error: 'Creator has not set a subscription price yet' }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: isSubscription
        ? [
            {
              price: priceId!,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Unlock Post #${postId}`,
                },
                unit_amount: amount,
              },
              quantity: 1,
            },
          ],
      payment_intent_data: !isSubscription
        ? {
            application_fee_amount: Math.round(amount * 0.2), // 20% platform fee
            transfer_data: {
              destination: creator.stripeAccountId,
            },
          }
        : undefined,
      subscription_data: isSubscription
        ? {
            application_fee_percent: 20,
            transfer_data: {
              destination: creator.stripeAccountId,
            },
          }
        : undefined,
      metadata: {
        creatorId: String(creatorId),
        userId: String(session.user.id),
        type,
        postId: postId || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe-success?creatorId=${creatorId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/creator/${creator.name}?canceled=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('❌ Stripe session error:', error.message || error);
    return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
  }
}

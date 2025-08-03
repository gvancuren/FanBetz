// src/app/api/user-subscription/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripeInstance } from '@/lib/stripe'; // ✅ Safe Stripe init helper

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { creatorId, plan } = await req.json();

  if (!creatorId || !['weekly', 'monthly'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({
    where: { id: Number(creatorId) },
  });

  if (!creator || !creator.stripeAccountId) {
    return NextResponse.json({ error: 'Creator not properly onboarded with Stripe' }, { status: 400 });
  }

  const priceCents =
    plan === 'weekly' ? creator.weeklyPrice : creator.monthlyPrice;

  if (!priceCents) {
    return NextResponse.json({ error: 'Pricing not set by creator' }, { status: 400 });
  }

  const feeCents = Math.floor(priceCents * 0.2); // 20% platform fee

  const stripe = getStripeInstance(); // ✅ Use helper for safe Stripe import

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: priceCents,
            product_data: {
              name: `${creator.name}'s ${plan} subscription`,
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeCents,
        transfer_data: {
          destination: creator.stripeAccountId,
        },
      },
      metadata: {
        userId: String(session.user.id),
        creatorId: String(creator.id),
        type: plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe-success?creatorId=${creator.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe-cancel`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('❌ Stripe session creation failed:', error);
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 });
  }
}

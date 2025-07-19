import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // ✅ Updated to match latest Stripe type
});

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (user?.stripeAccountId) {
    return NextResponse.json({
      url: `https://dashboard.stripe.com/connect/accounts/${user.stripeAccountId}`,
    });
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: session.user.email || undefined,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { stripeAccountId: account.id },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding/complete`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url });
}

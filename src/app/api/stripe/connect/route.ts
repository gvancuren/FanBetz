// ✅ File: /app/api/stripe/connect/route.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  let accountId = user.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email ?? undefined,
    });

    accountId = account.id;

    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: accountId },
    });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin || !origin.startsWith('https://')) {
    console.error('❌ Invalid NEXT_PUBLIC_SITE_URL:', origin);
    return NextResponse.json({ error: 'Invalid site URL' }, { status: 500 });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/creator/${user.name}?stripe=refresh`,
    return_url: `${origin}/creator/${user.name}?stripe=return`,
    type: 'account_onboarding',
  });

  console.log('✅ Redirecting to Stripe onboarding:', accountLink.url);
  return NextResponse.json({ url: accountLink.url });
}

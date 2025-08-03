// ✅ src/app/api/create-connected-account/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id as any, 10); // Cast to `any` in case ID is string
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ✅ Move Stripe require inside route to avoid build errors
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  // ✅ Reuse existing Stripe account if already connected
  if (user.stripeAccountId) {
    return NextResponse.json({
      url: `https://dashboard.stripe.com/connect/accounts/${user.stripeAccountId}`,
    });
  }

  // ✅ Create new Stripe Express account
  const account = await stripe.accounts.create({
    type: 'express',
    email: session.user.email || undefined,
  });

  // ✅ Save Stripe account ID to user
  await prisma.user.update({
    where: { id: userId },
    data: { stripeAccountId: account.id },
  });

  // ✅ Create onboarding link
  const origin = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${origin}/onboarding/refresh`,
    return_url: `${origin}/onboarding/complete`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url });
}

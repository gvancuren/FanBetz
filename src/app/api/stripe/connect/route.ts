// /app/api/stripe/connect/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let accountId = user.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email ?? undefined,
    });

    accountId = account.id;

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { stripeAccountId: accountId },
    });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/creator/${user.name}?stripe=refresh`,
    return_url: `${origin}/creator/${user.name}?stripe=return`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url }); // ✅ return JSON
}

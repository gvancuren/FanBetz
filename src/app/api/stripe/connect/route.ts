import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('❌ Unauthorized: no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error('❌ User not found in database');
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

      console.log(`✅ Stripe Express account created: ${accountId}`);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin || !origin.startsWith('https://')) {
      console.error('❌ Invalid NEXT_PUBLIC_SITE_URL:', origin);
      return NextResponse.json({ error: 'Invalid site URL' }, { status: 500 });
    }

    const refreshUrl = `${origin}/creator/${encodeURIComponent(user.name ?? '')}?stripe=refresh`;
    const returnUrl = `${origin}/creator/${encodeURIComponent(user.name ?? '')}?stripe=return`;

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    console.log('✅ Stripe onboarding link created:', accountLink.url);
    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('❌ Stripe connect error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeInstance } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const stripe = getStripeInstance();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: Number(user.id) },
    });

    let stripeAccountId = dbUser?.stripeAccountId;

    // Force a new Stripe account if it's missing or broken (like from test mode)
    if (!stripeAccountId || stripeAccountId.startsWith('acct_1Rr')) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: user.email || undefined,
      });

      await prisma.user.update({
        where: { id: Number(user.id) },
        data: { stripeAccountId: account.id },
      });

      stripeAccountId = account.id;
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('❌ Stripe onboarding error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

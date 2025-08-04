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
      console.error('❌ No user session found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: Number(user.id) },
    });

    let stripeAccountId = dbUser?.stripeAccountId;

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl || !baseUrl.startsWith('https://')) {
      console.error('❌ Invalid NEXT_PUBLIC_BASE_URL:', baseUrl);
      return NextResponse.json({ error: 'Invalid site URL' }, { status: 500 });
    }

    const refreshUrl = `${baseUrl}/dashboard`;
    const returnUrl = `${baseUrl}/dashboard`;

    console.log('🌐 Stripe accountLink return_url:', returnUrl);

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    console.log('✅ Redirecting to Stripe onboarding:', accountLink.url);
    return NextResponse.redirect(accountLink.url, 303);
  } catch (err: any) {
    console.error('❌ Stripe onboarding error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

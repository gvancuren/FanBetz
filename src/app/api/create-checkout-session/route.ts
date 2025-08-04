// ✅ src/app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeInstance } from '@/lib/stripe';

interface CustomUser {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(req: Request) {
  console.log('📩 Incoming checkout session request...');

  const session = await getServerSession(authOptions);
  const user = session?.user as CustomUser | undefined;

  if (!user?.id) {
    console.error('❌ Unauthorized: no session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
    console.log('📦 Request body:', body);
  } catch (err) {
    console.error('❌ Invalid JSON:', err);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { creatorId, type, postId, amount: rawAmount } = body;

  const amount = !rawAmount || isNaN(Number(rawAmount))
    ? 0
    : typeof rawAmount === 'string'
      ? parseFloat(rawAmount)
      : rawAmount;

  console.log('💵 Parsed amount:', amount);

  if (!creatorId || !type || (type === 'post' && !postId)) {
    console.error('❌ Missing required parameters');
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const creator = await prisma.user.findUnique({
    where: { id: Number(creatorId) },
  });

  if (!creator || !creator.stripeAccountId) {
    console.error('❌ Creator not found or missing Stripe account');
    return NextResponse.json({ error: 'Creator not eligible for payments' }, { status: 400 });
  }

  const isSubscription = type === 'weekly' || type === 'monthly';
  const priceId = type === 'weekly' ? creator.weeklyPriceId : creator.monthlyPriceId;

  if (isSubscription && !priceId) {
    console.error(`❌ Missing price ID for subscription type: ${type}`);
    return NextResponse.json({ error: 'Creator has not set a subscription price yet' }, { status: 400 });
  }

  // ✅ Handle FREE or blank-priced post unlock immediately
  if (type === 'post' && amount === 0) {
    try {
      const unlock = await prisma.postUnlock.create({
        data: {
          userId: user.id,
          postId,
        },
      });

      console.log('✅ Free or blank-price post unlocked directly in DB:', unlock);
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/creator/${creator.name}?unlocked=1`,
      });
    } catch (err) {
      console.error('❌ Failed to unlock free post:', err);
      return NextResponse.json({ error: 'Failed to unlock free post' }, { status: 500 });
    }
  }

  const stripe = getStripeInstance();

  const finalAmount = Math.round(Number(amount)) < 100
    ? Math.round(Number(amount) * 100)
    : Math.round(Number(amount));

  try {
    const sessionPayload: any = {
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: isSubscription
        ? [{ price: priceId!, quantity: 1 }]
        : [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Unlock Post #${postId}`,
              },
              unit_amount: finalAmount,
            },
            quantity: 1,
          }],
      metadata: {
        creatorId: String(creatorId),
        userId: String(user.id),
        type,
        postId: postId ? String(postId) : '',
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe-success?creatorId=${creatorId}&type=${type}&postId=${postId || ''}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/creator/${creator.name}?canceled=1`,
    };

    if (isSubscription) {
      sessionPayload.subscription_data = {
        application_fee_percent: 20,
        transfer_data: {
          destination: creator.stripeAccountId,
        },
      };
    } else {
      sessionPayload.payment_intent_data = {
        application_fee_amount: Math.round(finalAmount * 0.2),
        transfer_data: {
          destination: creator.stripeAccountId,
        },
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionPayload);
    console.log(`✅ Stripe checkout session created: ${checkoutSession.id}`);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('❌ Stripe session creation failed:', error);
    return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 500 });
  }
}

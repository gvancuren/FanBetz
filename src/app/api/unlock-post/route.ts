import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, amount } = await req.json();
  const userId = Number(session.user.id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  if (!post || !post.user.stripeAccountId) {
    return NextResponse.json({ error: 'Post or creator not found' }, { status: 404 });
  }

  // ✅ Move require inside route to avoid build failure
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  const platformFee = Math.floor(amount * 0.2); // 20% platform cut

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Unlock Post: ${post.title}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: post.user.stripeAccountId,
        },
      },
      metadata: {
        type: 'post',
        postId: postId.toString(),
        userId: userId.toString(),
        creatorId: post.userId.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe-success?creatorId=${post.userId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/creator/${post.user.name}`,
    });

    console.log('✅ Stripe unlock session created:', checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('❌ Stripe checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  }
}

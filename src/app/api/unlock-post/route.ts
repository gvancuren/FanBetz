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
  const numericPostId = Number(postId); // Ensure integer

  if (!numericPostId) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: numericPostId },
    include: { user: true },
  });

  if (!post || !post.user?.stripeAccountId) {
    return NextResponse.json({ error: 'Post or creator not found' }, { status: 404 });
  }

  // ✅ Handle free post unlock (skip Stripe)
  if (!amount || Number(amount) === 0) {
    try {
      const unlock = await prisma.postUnlock.create({
        data: {
          userId,
          postId: numericPostId,
        },
      });

      console.log('✅ Free post unlocked directly:', unlock);
      return NextResponse.json({ unlocked: true });
    } catch (err) {
      console.error('❌ Failed to unlock free post:', err);
      return NextResponse.json({ error: 'Failed to unlock free post' }, { status: 500 });
    }
  }

  // ✅ Stripe logic for paid unlocks
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  const platformFee = Math.floor(Number(amount) * 0.2); // 20% cut

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
            unit_amount: Math.round(Number(amount)),
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
        postId: numericPostId.toString(),
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

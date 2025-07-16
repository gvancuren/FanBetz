import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId, amount } = await req.json();
  const userId = Number(session.user.id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
    },
  });

  if (!post || !post.user.stripeAccountId) {
    return NextResponse.json({ error: 'Post or creator not found' }, { status: 404 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
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
      success_url: `${process.env.NEXTAUTH_URL}/subscribe-success?creatorId=${post.userId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/creator/${post.user.name}`,
      customer_email: session.user.email ?? undefined,
      payment_intent_data: {
        transfer_data: {
          destination: post.user.stripeAccountId,
        },
      },
      metadata: {
        postId,
        userId: userId.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  }
}

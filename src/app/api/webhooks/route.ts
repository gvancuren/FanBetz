import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req.body as any);
    const sig = req.headers.get('stripe-signature')!;
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('🎯 Stripe Event:', event.type);
  } catch (err: any) {
    console.error('❌ Signature Verification Error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // 🔁 Subscription renewal logic
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const firstLine = invoice.lines.data[0];
      const stripeSubId = typeof firstLine?.subscription === 'string' ? firstLine.subscription : '';

      if (!stripeSubId) return new NextResponse('No subscription ID', { status: 400 });

      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
      });

      if (sub) {
        const newExpiresAt = new Date(sub.expiresAt);
        sub.plan === 'weekly'
          ? newExpiresAt.setDate(newExpiresAt.getDate() + 7)
          : newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

        await prisma.subscription.update({
          where: { id: sub.id },
          data: { expiresAt: newExpiresAt },
        });

        console.log(`🔁 Renewed: ${sub.plan} until ${newExpiresAt.toISOString()}`);
      }
    }

    // 🧾 Checkout completed logic
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      if (!metadata) throw new Error('Missing metadata in checkout session');

      const { userId, creatorId, postId, type } = metadata;
      const subscriberId = parseInt(userId);
      const creatorIdInt = parseInt(creatorId);

      if (type === 'weekly' || type === 'monthly') {
        const creator = await prisma.user.findUnique({ where: { id: creatorIdInt } });
        const price = type === 'weekly' ? creator?.weeklyPrice : creator?.monthlyPrice;

        const expiresAt = new Date();
        type === 'weekly'
          ? expiresAt.setDate(expiresAt.getDate() + 7)
          : expiresAt.setMonth(expiresAt.getMonth() + 1);

        await prisma.subscription.create({
          data: {
            plan: type,
            price: price || 0,
            expiresAt,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
            subscriber: { connect: { id: subscriberId } },
            creator: { connect: { id: creatorIdInt } },
          },
        });

        console.log(`✅ Subscription created: ${type} plan for user ${subscriberId}`);
      }

      if (type === 'post' && postId) {
        await prisma.postUnlock.create({
          data: {
            userId: subscriberId,
            postId: parseInt(postId),
          },
        });

        console.log(`🔓 Post unlocked: user ${subscriberId}, post ${postId}`);
      }
    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (err: any) {
    console.error('❌ Handler Error:', err.message || err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

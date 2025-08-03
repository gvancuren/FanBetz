import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const config = {
  api: { bodyParser: false },
};

// ✅ Define Stripe INSIDE the function (to avoid early access to env vars)
function getStripeInstance() {
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });
}

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
  const stripe = getStripeInstance(); // ✅ Safe use
  const rawBody = await buffer(req.body as any);
  const sig = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('🎯 Stripe Event:', event.type);
  } catch (err: any) {
    console.error('❌ Stripe signature failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;
      if (!metadata) throw new Error('Missing metadata');

      const plan = metadata.type;
      const subscriberId = parseInt(metadata.userId);
      const creatorId = parseInt(metadata.creatorId);

      if (plan === 'weekly' || plan === 'monthly') {
        const creator = await prisma.user.findUnique({ where: { id: creatorId } });
        const price = plan === 'weekly' ? creator?.weeklyPrice : creator?.monthlyPrice;
        const expiresAt = new Date();
        plan === 'weekly'
          ? expiresAt.setDate(expiresAt.getDate() + 7)
          : expiresAt.setMonth(expiresAt.getMonth() + 1);

        await prisma.subscription.create({
          data: {
            plan,
            price: price ?? 0,
            expiresAt,
            subscriber: { connect: { id: subscriberId } },
            creator: { connect: { id: creatorId } },
            stripeSubscriptionId: session.subscription ?? undefined,
          },
        });
        console.log('✅ Subscription created:', plan);
      }

      if (plan === 'post') {
        const postId = parseInt(metadata.postId);
        await prisma.postUnlock.create({
          data: { userId: subscriberId, postId },
        });
        console.log('🔓 Post unlocked:', postId);
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const stripeSubId = invoice?.lines?.data?.[0]?.subscription;
      if (!stripeSubId) return new NextResponse('No sub ID', { status: 400 });

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

        console.log('🔁 Subscription renewed:', newExpiresAt);
      }
    }

    return new NextResponse('Webhook handled', { status: 200 });
  } catch (err: any) {
    console.error('❌ Handler error:', err.message);
    return new NextResponse('Webhook error', { status: 500 });
  }
}

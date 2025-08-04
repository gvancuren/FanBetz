import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const config = {
  api: { bodyParser: false },
};

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  console.log('🔑 STRIPE_SECRET_KEY loaded:', secretKey);
  if (!secretKey) {
    throw new Error('❌ STRIPE_SECRET_KEY is undefined at runtime.');
  }

  return new Stripe(secretKey, {
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
  console.log('🔔 Webhook endpoint hit');
  console.log('🔎 Loaded STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY); // 🔍 Confirm loading

  const stripe = getStripeInstance();
  let rawBody: Buffer;

  try {
    rawBody = await buffer(req.body as any);
  } catch (err) {
    console.error('❌ Failed to read raw body:', err);
    return new NextResponse('Bad Request', { status: 400 });
  }

  const sig = req.headers.get('stripe-signature')!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Stripe event:', event.type);
  } catch (err: any) {
    console.error('❌ Signature verification failed:', err.message);
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

        const result = await prisma.subscription.create({
          data: {
            plan,
            price: price ?? 0,
            expiresAt,
            stripeSubscriptionId: session.subscription ?? undefined,
            subscriber: { connect: { id: subscriberId } },
            creator: { connect: { id: creatorId } },
          },
        });

        console.log(`✅ Subscription created for user ${subscriberId}:`, result);
      }

      if (plan === 'post') {
        const postId = parseInt(metadata.postId);
        const result = await prisma.postUnlock.create({
          data: { userId: subscriberId, postId },
        });

        console.log(`🔓 Post unlocked for user ${subscriberId}, post ${postId}`, result);
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const stripeSubId = invoice?.lines?.data?.[0]?.subscription;

      if (!stripeSubId) {
        console.warn('⚠️ No subscription ID found in invoice');
        return new NextResponse('No subscription ID', { status: 400 });
      }

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

        console.log(`🔁 Subscription renewed for ${sub.plan}, new expiry: ${newExpiresAt}`);
      } else {
        console.warn(`⚠️ Subscription not found for Stripe ID ${stripeSubId}`);
      }
    }

    return new NextResponse('✅ Webhook handled', { status: 200 });
  } catch (err: any) {
    console.error('❌ Webhook handler error:', err.message);
    return new NextResponse('Webhook error', { status: 500 });
  }
}

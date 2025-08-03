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
  const rawBody = await buffer(req.body as any);
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('🎯 Stripe Event Type:', event.type);
    console.log('📦 Payload:', JSON.stringify(event.data.object, null, 2));
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 🔍 Test DB call to isolate Prisma connection issue
  try {
    console.log('🚦 Testing Prisma connection...');
    const test = await prisma.user.findFirst(); // any harmless query
    console.log('🧠 Prisma connected successfully');
  } catch (err: any) {
    console.error('❌ Prisma DB connection failed:', err.message);
    return new NextResponse('Database connection error', { status: 500 });
  }

  try {
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const firstLine = invoice.lines?.data?.[0];
      const stripeSubId = typeof firstLine?.subscription === 'string' ? firstLine.subscription : '';

      if (!stripeSubId) return new NextResponse('No subscription ID', { status: 400 });

      const userSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
      });

      if (userSub) {
        const newExpiresAt = new Date(userSub.expiresAt);
        userSub.plan === 'weekly'
          ? newExpiresAt.setDate(newExpiresAt.getDate() + 7)
          : newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

        await prisma.subscription.update({
          where: { id: userSub.id },
          data: { expiresAt: newExpiresAt },
        });

        console.log(`🔁 Subscription renewed. New expiresAt: ${newExpiresAt.toISOString()}`);
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      if (!metadata) throw new Error('Missing metadata');

      const plan = metadata.type;
      const subscriberId = parseInt(metadata.userId);
      const creatorId = parseInt(metadata.creatorId);

      console.log(`📦 Checkout completed: plan=${plan}, subscriberId=${subscriberId}, creatorId=${creatorId}`);

      if (plan === 'weekly' || plan === 'monthly') {
        const creator = await prisma.user.findUnique({ where: { id: creatorId } });
        const priceCents = plan === 'weekly' ? creator?.weeklyPrice : creator?.monthlyPrice;
        const expiresAt = new Date();
        plan === 'weekly'
          ? expiresAt.setDate(expiresAt.getDate() + 7)
          : expiresAt.setMonth(expiresAt.getMonth() + 1);

        await prisma.subscription.create({
          data: {
            plan,
            price: priceCents || 0,
            expiresAt,
            subscriber: { connect: { id: subscriberId } },
            creator: { connect: { id: creatorId } },
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
          },
        });

        console.log(`✅ Subscription created: ${plan} plan for user ${subscriberId}`);
      }

      if (plan === 'post') {
        const postId = parseInt(metadata.postId);
        await prisma.postUnlock.create({
          data: {
            userId: subscriberId,
            postId,
          },
        });

        console.log(`🔓 Post unlocked: user ${subscriberId}, post ${postId}`);
      }
    }

    return new NextResponse('Webhook received', { status: 200 });
  } catch (err: any) {
    console.error('❌ Webhook handler error:', err.message || err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

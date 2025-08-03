// src/app/api/webhooks/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// ✅ Required to allow Stripe raw body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') as string;
  let event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // ✅ Subscription renewal handler
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const firstLine = invoice.lines?.data?.[0];
      const stripeSubId = typeof firstLine?.subscription === 'string' ? firstLine.subscription : '';

      if (!stripeSubId) {
        console.warn('⚠️ Missing subscription ID on invoice');
        return new Response('No subscription ID', { status: 400 });
      }

      const userSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: stripeSubId },
      });

      if (userSub) {
        const newExpiresAt = new Date(userSub.expiresAt);

        if (userSub.plan === 'weekly') {
          newExpiresAt.setDate(newExpiresAt.getDate() + 7);
        } else if (userSub.plan === 'monthly') {
          newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
        }

        await prisma.subscription.update({
          where: { id: userSub.id },
          data: { expiresAt: newExpiresAt },
        });

        console.log(`🔁 Subscription renewed. New expiresAt: ${newExpiresAt.toISOString()}`);
      }
    }

    // ✅ Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      if (!metadata) throw new Error('Missing metadata');

      const plan = metadata.type;
      const subscriberId = parseInt(metadata.userId);
      const creatorId = parseInt(metadata.creatorId);

      if (isNaN(subscriberId) || isNaN(creatorId)) {
        throw new Error('Invalid subscriber or creator ID');
      }

      if (plan === 'weekly' || plan === 'monthly') {
        const creator = await prisma.user.findUnique({
          where: { id: creatorId },
        });

        if (!creator) throw new Error('Creator not found');

        const priceCents = plan === 'weekly' ? creator.weeklyPrice : creator.monthlyPrice;
        if (!priceCents) throw new Error('Missing price on creator profile');

        const expiresAt = new Date();
        if (plan === 'weekly') {
          expiresAt.setDate(expiresAt.getDate() + 7);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        await prisma.subscription.create({
          data: {
            plan,
            price: priceCents,
            expiresAt,
            subscriber: { connect: { id: subscriberId } },
            creator: { connect: { id: creatorId } },
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
          },
        });

        console.log(`✅ Subscription saved for ${plan} plan`);
      }

      if (plan === 'post') {
        const postId = parseInt(metadata.postId);
        if (isNaN(postId)) throw new Error('Invalid post ID');

        await prisma.postUnlock.create({
          data: {
            userId: subscriberId,
            postId,
          },
        });

        console.log(`✅ Post unlock saved for post ID ${postId}`);
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('❌ Webhook handler failed:', err);
    return new Response('Webhook handler failed', { status: 500 });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔔 Webhook endpoint hit (pages/api/webhooks.ts)');

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  let event;
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('❌ Missing Stripe signature');
    return res.status(400).send('Missing signature');
  }

  let rawBody: Buffer;
  try {
    rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log(`✅ Verified event: ${event.type}`);
  } catch (err: any) {
    console.error('❌ Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
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

        console.log(`✅ Subscription created:`, result);
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
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubId = invoice?.lines?.data?.[0]?.subscription;

      if (!stripeSubId) {
        console.warn('⚠️ No subscription ID found in invoice');
        return res.status(400).send('Missing subscription ID');
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

        console.log(`🔁 Subscription renewed, new expiry: ${newExpiresAt}`);
      }
    }

    res.status(200).send('✅ Webhook handled');
  } catch (err: any) {
    console.error('❌ Webhook handler error:', err.message);
    res.status(500).send('Webhook handler failed');
  }
}

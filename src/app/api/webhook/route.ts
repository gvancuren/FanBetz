// ✅ /src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Stripe import using CommonJS to avoid Vercel eval errors
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY!);

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const sig = req.headers.get('stripe-signature');
  const rawBody = await buffer(req.body as any);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Stripe Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // ✅ Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const metadata = session.metadata;
    const userId = parseInt(metadata?.userId || '');
    const postId = parseInt(metadata?.postId || '');
    const creatorId = parseInt(metadata?.creatorId || '');
    const type = metadata?.type;

    console.log('✅ Webhook received:', { userId, postId, creatorId, type });

    if (type === 'post') {
      await prisma.unlock.create({
        data: {
          userId,
          postId,
        },
      });
      console.log('✅ Post unlocked');
    } else if (type === 'subscription') {
      const duration = metadata?.duration; // 'weekly' or 'monthly'
      const now = new Date();
      const expiresAt =
        duration === 'monthly'
          ? new Date(now.setMonth(now.getMonth() + 1))
          : new Date(now.setDate(now.getDate() + 7));

      await prisma.subscription.create({
        data: {
          userId,
          creatorId,
          expiresAt,
        },
      });
      console.log('✅ Subscription created');
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

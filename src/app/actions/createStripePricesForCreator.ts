'use server';

import { prisma } from '@/lib/prisma';

/**
 * Dynamically creates a Stripe Product and two recurring Price objects for a creator,
 * based on their weekly and monthly prices stored in the database.
 */
export async function createStripePricesForCreator(user: {
  id: number;
  name: string;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
}) {
  if (!user.weeklyPrice && !user.monthlyPrice) return;

  // ✅ Stripe safely initialized inside the function
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });

  // Create or update Product in Stripe
  const product = await stripe.products.create({
    name: `${user.name}'s FanBetz Subscription`,
    metadata: {
      creatorId: String(user.id),
    },
  });

  // Create weekly price
  if (user.weeklyPrice) {
    const weeklyPrice = await stripe.prices.create({
      unit_amount: user.weeklyPrice,
      currency: 'usd',
      recurring: { interval: 'week' },
      product: product.id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        weeklyPriceId: weeklyPrice.id,
      },
    });
  }

  // Create monthly price
  if (user.monthlyPrice) {
    const monthlyPrice = await stripe.prices.create({
      unit_amount: user.monthlyPrice,
      currency: 'usd',
      recurring: { interval: 'month' },
      product: product.id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyPriceId: monthlyPrice.id,
      },
    });
  }
}

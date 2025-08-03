// lib/stripe.ts (SAFE for server functions)

export function getStripeInstance() {
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
  });
}

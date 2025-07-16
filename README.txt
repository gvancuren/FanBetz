FanBetz Subscription System Integration Steps:

1. Place these files into your fanbetz-ui project.
2. Update your .env with:
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
3. Run:
   npx prisma migrate dev --name add_subscription_support
4. Set prices as a creator and subscribe as a user to test.

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monthlyPriceId" TEXT,
ADD COLUMN     "stripeProductId" TEXT,
ADD COLUMN     "weeklyPriceId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionPriceMonthly" DOUBLE PRECISION,
ADD COLUMN     "subscriptionPriceWeekly" DOUBLE PRECISION;

/*
  Warnings:

  - You are about to drop the `SubscriptionSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SubscriptionSetting" DROP CONSTRAINT "SubscriptionSetting_creatorId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monthlyPrice" INTEGER,
ADD COLUMN     "weeklyPrice" INTEGER;

-- DropTable
DROP TABLE "SubscriptionSetting";

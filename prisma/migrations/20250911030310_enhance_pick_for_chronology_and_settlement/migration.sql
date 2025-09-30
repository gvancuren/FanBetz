/*
  Warnings:

  - Added the required column `eventStartAt` to the `Pick` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PickStatus" AS ENUM ('PENDING', 'LIVE', 'SETTLED');

-- CreateEnum
CREATE TYPE "public"."PickOutcome" AS ENUM ('WIN', 'LOSS', 'PUSH', 'VOID');

-- AlterTable
ALTER TABLE "public"."Pick" ADD COLUMN     "awayTeam" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "eventStartAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gradedBy" TEXT,
ADD COLUMN     "homeTeam" TEXT,
ADD COLUMN     "league" TEXT,
ADD COLUMN     "line" DOUBLE PRECISION,
ADD COLUMN     "marketType" TEXT,
ADD COLUMN     "odds" INTEGER,
ADD COLUMN     "outcome" "public"."PickOutcome",
ADD COLUMN     "selection" TEXT,
ADD COLUMN     "settledAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."PickStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Pick_eventStartAt_idx" ON "public"."Pick"("eventStartAt");

-- CreateIndex
CREATE INDEX "Pick_status_idx" ON "public"."Pick"("status");

-- CreateIndex
CREATE INDEX "Pick_completedAt_idx" ON "public"."Pick"("completedAt");

-- CreateIndex
CREATE INDEX "Pick_league_eventId_idx" ON "public"."Pick"("league", "eventId");

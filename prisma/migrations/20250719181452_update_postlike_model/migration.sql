/*
  Warnings:

  - The `category` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer', 'Golf', 'NCAA');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category",
ADD COLUMN     "category" "Category";

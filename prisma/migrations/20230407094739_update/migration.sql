/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "createdByUserId";
ALTER TABLE "Reward" ADD COLUMN     "createdBy" STRING NOT NULL;
ALTER TABLE "Reward" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

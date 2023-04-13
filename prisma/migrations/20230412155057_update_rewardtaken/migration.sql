/*
  Warnings:

  - Made the column `rewardTaken` on table `Reward` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reward" ALTER COLUMN "rewardTaken" SET NOT NULL;
ALTER TABLE "Reward" ALTER COLUMN "rewardTaken" SET DEFAULT 0;

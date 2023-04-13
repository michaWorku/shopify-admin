/*
  Warnings:

  - You are about to drop the column `formId` on the `DynamicFormSubmission` table. All the data in the column will be lost.
  - Added the required column `rewardId` to the `DynamicFormSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DynamicFormSubmission" DROP CONSTRAINT "DynamicFormSubmission_formId_fkey";

-- AlterTable
ALTER TABLE "DynamicFormSubmission" DROP COLUMN "formId";
ALTER TABLE "DynamicFormSubmission" ADD COLUMN     "rewardId" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "DynamicFormSubmission" ADD CONSTRAINT "DynamicFormSubmission_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

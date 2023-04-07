/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `createdByUserId` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "createdBy";
ALTER TABLE "Reward" ADD COLUMN     "createdByUserId" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

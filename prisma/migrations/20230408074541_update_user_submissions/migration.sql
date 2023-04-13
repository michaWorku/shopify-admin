/*
  Warnings:

  - You are about to drop the `_ClientToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClientToUser" DROP CONSTRAINT "_ClientToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClientToUser" DROP CONSTRAINT "_ClientToUser_B_fkey";

-- AlterTable
ALTER TABLE "DynamicFormSubmission" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "middleName" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" DROP NOT NULL;

-- DropTable
DROP TABLE "_ClientToUser";

-- CreateTable
CREATE TABLE "ClientUser" (
    "userId" STRING NOT NULL,
    "isRewarded" BOOL NOT NULL DEFAULT true,
    "isSystemUser" BOOL NOT NULL DEFAULT false,
    "clientId" STRING NOT NULL,

    CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("userId","clientId")
);

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

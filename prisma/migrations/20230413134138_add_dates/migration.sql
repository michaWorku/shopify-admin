/*
  Warnings:

  - Added the required column `updatedAt` to the `ClientUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RoleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserReward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ClientUser" ADD COLUMN     "deletedAt" TIMESTAMP(3);
ALTER TABLE "ClientUser" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RolePermission" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "RolePermission" ADD COLUMN     "deletedAt" TIMESTAMP(3);
ALTER TABLE "RolePermission" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RoleUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "RoleUser" ADD COLUMN     "deletedAt" TIMESTAMP(3);
ALTER TABLE "RoleUser" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserReward" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "UserReward" ADD COLUMN     "deletedAt" TIMESTAMP(3);
ALTER TABLE "UserReward" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

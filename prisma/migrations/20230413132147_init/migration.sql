-- CreateEnum
CREATE TYPE "DynamicFormFieldType" AS ENUM ('TEXT', 'NUMBER', 'EMAIL', 'PHONE', 'SELECT', 'CHECKBOX', 'RADIO', 'TEXTAREA', 'DATE');

-- CreateEnum
CREATE TYPE "PLAN" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BulkStatus" AS ENUM ('InProgress', 'Complete', 'Failed', 'Canceled', 'Canceling');

-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "firstName" STRING,
    "middleName" STRING,
    "lastName" STRING,
    "phone" STRING NOT NULL,
    "email" STRING,
    "gender" "Gender",
    "password" STRING,
    "birthDate" TIMESTAMP(3),
    "isVerified" BOOL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING,
    "createdBy" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING,
    "category" STRING,
    "subject" STRING NOT NULL,
    "action" STRING NOT NULL,
    "conditions" JSONB,
    "fields" STRING[] DEFAULT ARRAY[]::STRING[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleUser" (
    "userId" STRING NOT NULL,
    "roleId" STRING NOT NULL,

    CONSTRAINT "RoleUser_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" STRING NOT NULL,
    "permissionId" STRING NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "ClientUser" (
    "userId" STRING NOT NULL,
    "isRewarded" BOOL NOT NULL DEFAULT false,
    "isSystemUser" BOOL NOT NULL DEFAULT false,
    "clientId" STRING NOT NULL,

    CONSTRAINT "ClientUser_pkey" PRIMARY KEY ("userId","clientId")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "promotionText" STRING NOT NULL,
    "url" STRING,
    "phone" STRING NOT NULL,
    "email" STRING,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReward" (
    "userId" STRING NOT NULL,
    "rewardId" STRING NOT NULL,

    CONSTRAINT "UserReward_pkey" PRIMARY KEY ("userId","rewardId")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING,
    "rewardTaken" INT4 NOT NULL DEFAULT 0,
    "rewardGiven" INT4 NOT NULL,
    "plan" "PLAN" NOT NULL DEFAULT 'DAY',
    "clientId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "formId" STRING NOT NULL,
    "createdBy" STRING NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicForm" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING,
    "clientId" STRING NOT NULL,
    "createdBy" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DynamicForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFormField" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "label" STRING NOT NULL,
    "description" STRING,
    "type" "DynamicFormFieldType" NOT NULL,
    "required" BOOL NOT NULL,
    "options" JSONB,
    "placeholder" STRING,
    "defaultValue" JSONB,
    "order" INT4 NOT NULL,
    "formId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DynamicFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFormSubmission" (
    "id" STRING NOT NULL,
    "data" JSONB NOT NULL,
    "submittedById" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "rewardId" STRING NOT NULL,

    CONSTRAINT "DynamicFormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkTask" (
    "id" STRING NOT NULL,
    "discription" STRING NOT NULL,
    "status" "BulkStatus" NOT NULL,
    "taskCount" INT4 NOT NULL,
    "faildCount" INT4 NOT NULL,
    "successCount" INT4 NOT NULL,
    "createdById" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BulkTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" STRING NOT NULL,
    "data" JSONB NOT NULL,
    "status" "BulkStatus" NOT NULL,
    "message" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "bulkId" STRING,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- AddForeignKey
ALTER TABLE "RoleUser" ADD CONSTRAINT "RoleUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleUser" ADD CONSTRAINT "RoleUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientUser" ADD CONSTRAINT "ClientUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicForm" ADD CONSTRAINT "DynamicForm_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicFormField" ADD CONSTRAINT "DynamicFormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "DynamicForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicFormSubmission" ADD CONSTRAINT "DynamicFormSubmission_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicFormSubmission" ADD CONSTRAINT "DynamicFormSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkTask" ADD CONSTRAINT "BulkTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_bulkId_fkey" FOREIGN KEY ("bulkId") REFERENCES "BulkTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

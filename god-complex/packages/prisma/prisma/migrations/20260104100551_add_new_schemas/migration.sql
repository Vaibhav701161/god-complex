/*
  Warnings:

  - You are about to drop the column `time` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('STUDY', 'HEALTH', 'CAREER', 'BUILD', 'SOCIAL');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('COMPLETED', 'MIN_EFFORT', 'FAILED');

-- CreateEnum
CREATE TYPE "FailureReason" AS ENUM ('POOR_PLANNING', 'LOW_ENERGY', 'DISTRACTION', 'EXTERNAL_DEPENDENCY', 'FEAR_AVOIDANCE', 'SYSTEM_ASSIGNED');

-- DropIndex
DROP INDEX "User_name_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "time",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPledge" INTEGER NOT NULL,
    "cutoffHour" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "category" "GoalCategory" NOT NULL,
    "finishCondition" TEXT NOT NULL,
    "minEffort" TEXT NOT NULL,
    "isUncomfortable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalResult" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "GoalStatus" NOT NULL,
    "failureReason" "FailureReason",
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyOutcome" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "averageDailyScore" DOUBLE PRECISION NOT NULL,
    "activeDays" INTEGER NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "payoutAmount" INTEGER NOT NULL,
    "penaltyAmount" INTEGER NOT NULL,
    "platformFeeShare" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_groupId_month_key" ON "Membership"("userId", "groupId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Goal_userId_groupId_date_title_key" ON "Goal"("userId", "groupId", "date", "title");

-- CreateIndex
CREATE UNIQUE INDEX "GoalResult_goalId_key" ON "GoalResult"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyOutcome_userId_groupId_month_key" ON "MonthlyOutcome"("userId", "groupId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalResult" ADD CONSTRAINT "GoalResult_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalResult" ADD CONSTRAINT "GoalResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyOutcome" ADD CONSTRAINT "MonthlyOutcome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyOutcome" ADD CONSTRAINT "MonthlyOutcome_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

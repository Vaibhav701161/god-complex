-- CreateTable
CREATE TABLE "PenaltyAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "penaltyType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PenaltyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PenaltyAssignment_status_idx" ON "PenaltyAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PenaltyAssignment_userId_groupId_month_key" ON "PenaltyAssignment"("userId", "groupId", "month");

-- AddForeignKey
ALTER TABLE "PenaltyAssignment" ADD CONSTRAINT "PenaltyAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenaltyAssignment" ADD CONSTRAINT "PenaltyAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

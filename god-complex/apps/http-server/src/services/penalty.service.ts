import { prisma } from "@god-complex/prisma";
import { PenaltyType, PENALTY_DEFINITIONS } from "../lib/penalties";

export async function assignMonthlyPenalties(
  groupId: string,
  month: string,
  ranked: Array<{ userId: string; rank: number }>
) {
  const total = ranked.length;
  const half = Math.floor(total / 2);
  const losers = ranked.slice(half);

  for (const loser of losers) {
    const penaltyTypes = Object.values(PenaltyType);

   
    const index = loser.rank % penaltyTypes.length;
    const penaltyType = penaltyTypes[index];
    const definition = PENALTY_DEFINITIONS[penaltyType];

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + definition.dueInDays);

    await prisma.penaltyAssignment.create({
      data: {
        userId: loser.userId,
        groupId,
        month,
        penaltyType,
        dueDate,
      },
    });
  }
}

export async function autoFailOverduePenalties(){
  const now = new Date();

  await prisma.penaltyAssignment.updateMany({
    where: {
      dueDate: { lt: now },
      status: "PENDING",
    },
    data: {
      status: "FAILED",
    },
  });
}

export async function getPenaltyConsequences(
  userId: string,
  groupId: string
) {
  const failed = await prisma.penaltyAssignment.count({
    where: { userId, groupId, status: "FAILED" },
  });

  return {
    canJoinNextMonth: failed === 0,
    failedCount: failed,
    message:
      failed === 0
        ? "You are in good standing"
        : "Clear failed penalties to rejoin",
  };
}

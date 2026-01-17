import { prisma } from "@god-complex/prisma";
import { assertMembership } from "@/lib/guards";
import { assignMonthlyPenalties } from "./penalty.service";


export async function getMonthlyResult(
  userId: string,
  groupId: string,
  month: string
) {
  await assertMembership(userId, groupId, month);

  const outcome = await prisma.monthlyOutcome.findUnique({
    where: {
      userId_groupId_month: {
        userId,
        month,
        groupId,
      },
    },
  });
  const allOutcomes = await prisma.monthlyOutcome.findMany({
    where: {
      groupId,
      month,
    },
    orderBy: {
      rank: "asc",
    },
  });

  return {
    userOutcome: outcome,
    totalParticipants: allOutcomes.length,
    allRankings: allOutcomes,
  };
}

export async function closeMonth(
  groupId: string,
  month: string,
  auditContext: { source: "SYSTEM" | "ADMIN" | "CRON", reason?: string, correlationId?: string } = { source: "SYSTEM" }
) {
  // 1. Check if already closed (Cheap check before TX)
  const existing = await prisma.monthlyOutcome.findFirst({
    where: { groupId, month },
  });

  if (existing) {
    throw new Error("month already closed");
  }

  // 2. Wrap in Transaction
  await prisma.$transaction(async (tx) => {
    // Re-check inside TX
    const check = await tx.monthlyOutcome.findFirst({ where: { groupId, month } });
    if (check) return;

    // Check if all days are finalized?
    // Month string: "YYYY-MM"
    // We check if there are any days in this month that are NOT finalized.
    // However, database keys for DailyFinalization are strings "YYYY-MM-DD".
    // We can query startswith.

    // Note: If today is 5th of next month, we only care about days in THAT previous month.
    // The days in that month are "YYYY-MM-01" to "YYYY-MM-31".

    const pendingDays = await tx.dailyFinalization.count({
      where: {
        groupId,
        date: { startsWith: month },
        status: { not: "FINALIZED" }
      }
    });

    // Also check if we HAVE finalizations for all expected days?
    // That's harder. But ensuring no pending records is a start.
    // Ideally we assume daily cron ran. 
    // If strict: fail if pendingDays > 0.

    if (pendingDays > 0) {
      throw new Error(`Cannot close month ${month}: ${pendingDays} days are not finalized.`);
    }

    // Fetch Goals and Calculate
    const goals = await tx.goal.findMany({
      where: {
        groupId,
        date: {
          gte: new Date(`${month}-01`),
          lt: new Date(`${month}-31`), // Naive month end check
        },
      },
      include: { result: true },
    });

    const weeklyUncomfortableFailures = new Set<string>();
    const weeks = new Map<string, Map<string, number>>();

    for (const g of goals) {
      const weekKey = g.date.toISOString().slice(0, 10);
      if (!weeks.has(g.userId)) {
        weeks.set(g.userId, new Map());
      }
      const userWeeks = weeks.get(g.userId)!;
      if (!userWeeks.has(weekKey)) {
        userWeeks.set(weekKey, 0);
      }
      if (g.isUncomfortable) {
        userWeeks.set(weekKey, userWeeks.get(weekKey)! + 1);
      }
    }

    for (const [userId, weekMap] of Array.from(weeks.entries())) {
      for (const count of Array.from(weekMap.values())) {
        if (count === 0) {
          weeklyUncomfortableFailures.add(userId);
          break;
        }
      }
    }

    const userDayMap: Record<string, Record<string, number>> = {};

    for (const g of goals) {
      if (!g.result) continue;

      if (!userDayMap[g.userId]) {
        userDayMap[g.userId] = {};
      }

      const day = g.date.toISOString().split("T")[0];

      if (!userDayMap[g.userId][day]) {
        userDayMap[g.userId][day] = 0;
      }

      if (g.result.status === "COMPLETED") {
        userDayMap[g.userId][day] += 1;
      }
      if (g.result.status === "MIN_EFFORT") {
        userDayMap[g.userId][day] += 0.5;
      }
    }

    const finalScores = Object.entries(userDayMap).map(([userId, days]) => {
      const dailyScores = Object.values(days);
      const activeDays = dailyScores.length;
      const averageDailyScore =
        dailyScores.reduce((a, b) => a + b, 0) / activeDays;

      return {
        userId,
        finalScore: averageDailyScore * activeDays,
        averageDailyScore,
        activeDays,
      };
    });

    for (const user of finalScores) {
      if (weeklyUncomfortableFailures.has(user.userId)) {
        user.finalScore = 0;
      }
    }

    const ranked = finalScores.sort((a, b) => b.finalScore - a.finalScore);

    // Create Outcomes
    for (let index = 0; index < ranked.length; index++) {
      const userScore = ranked[index];
      await tx.monthlyOutcome.create({
        data: {
          userId: userScore.userId,
          groupId,
          month,
          finalScore: userScore.finalScore,
          rank: index + 1,
          averageDailyScore: userScore.averageDailyScore,
          activeDays: userScore.activeDays,
          payoutAmount: 0,
          penaltyAmount: 0,
          platformFeeShare: 0,
        }
      });
    }

    const rankingsWithRank = ranked.map((user, index) => ({
      userId: user.userId,
      rank: index + 1,
    }));

    // Assign Penalties
    await assignMonthlyPenalties(tx, groupId, month, rankingsWithRank);
  });
}
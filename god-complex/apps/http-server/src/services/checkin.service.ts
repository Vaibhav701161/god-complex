import { prisma } from "@god-complex/prisma";
import { FailureReason } from "../../../../packages/prisma/generated/prisma/enums";
import { assertMembership } from "@/lib/guards";
import { getMonth } from "@/lib/time";

interface CheckinInput {
  groupId: string;
  date: string;
  results: {
    goalId: string;
    status: "COMPLETED" | "MIN_EFFORT" | "FAILED";
    failureReason?: any;
  }[];
}

export async function submitCheckin(
  userId: string,
  data: CheckinInput
) {
  
  const { groupId, date, results } = data;

  const month = getMonth(date);
  await assertMembership(userId,groupId,month);

  const goals = await prisma.goal.findMany({
    where: {
      userId,
      groupId,
      date: new Date(date),
    },
  });

  if (goals.length === 0) {
    throw new Error("No goals found for this day");
  }

  if (results.length !== goals.length) {
    throw new Error("All goals must be checked in");
  }

  const existingResult = await prisma.goalResult.findMany({
    where: {
      goalId: { in: results.map(r => r.goalId) }
    }
  });

  if (existingResult.length > 0) {
    throw new Error("One or more goals have already been checked in.");
  }

  
  const processedResults = await Promise.all(
    results.map(async (r) => {
      if (r.status === "FAILED") {
        if (!r.failureReason) {
          throw new Error("Failure reason required");
        }
        
        const repeated = await hasRepeatedExcuse(userId, r.failureReason);
        if (repeated) {
          return {
            ...r,
            failureReason: "SYSTEM_ASSIGNED"
          };
        }
      }
      return r;
    })
  );

  await prisma.$transaction(
    processedResults.map((r) => {
      return prisma.goalResult.create({
        data: {
          goal: { connect: { id: r.goalId } },
          user: { connect: { id: userId } },
          status: r.status,
          failureReason: r.failureReason,
        },
      });
    })
  );
}

export async function hasRepeatedExcuse(
  userId: string,
  reason: any
): Promise<boolean> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);

  const count = await prisma.goalResult.count({
    where: {
      failureReason: reason,
      goal: {
        userId,
        date: { gte: since },
      },
    },
  });
  return count >= 2;
}

export async function autoFailMissedCheckins(date: string) {
  const goalsWithoutResult = await prisma.goal.findMany({
    where: {
      date: new Date(date),
      result: null,
    },
  });

  await prisma.goalResult.createMany({
    data: goalsWithoutResult.map(g => ({
      goalId: g.id,
      userId: g.userId,
      status: "FAILED",
      failureReason: "SYSTEM_ASSIGNED",
    })),
  });
}

import { prisma } from "@god-complex/prisma";
import { FailureReason } from "@god-complex/prisma";
import { assertMembership } from "@/lib/guards";
import { getMonth } from "@/lib/time";
import { resolveGroupDay } from "../lib/time-resolver";

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

  /* Temporal Validation */
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { timezone: true, cutoffHour: true }
  });
  if (!group) throw new Error("Group not found");

  const opDay = resolveGroupDay(new Date(), group.timezone, group.cutoffHour);

  // If the requested date is older than current operational day, and hasn't been finalized yet (cron missed),
  // we MUST REJECT it.
  // The system only allows checking in for the "Current" day.
  // Wait, does it allow checking in for "Yesterday" if within cutoff?
  // resolveGroupDay returns the "label" of the active day.
  // If Now is 3AM Jan 2nd (Cutoff 4), active day is Jan 1st.
  // So user sends date="2025-01-01". opDay.date is "2025-01-01". MATCH.

  if (date < opDay.date) {
    throw new Error("This day has passed. Check-in window closed.");
  }
  if (date > opDay.date) {
    throw new Error("Cannot check in for future days.");
  }

  const month = getMonth(date);
  await assertMembership(userId, groupId, month);

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

  for (const r of results) {
    const goal = goals.find(g => g.id === r.goalId);

    if (!goal) {
      throw new Error("Goal does not belong to this dayor user");
    }
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
          // Log the risk trigger
          await prisma.auditLog.create({
            data: {
              action: "EXCUSE_REJECTED",
              targetType: "GOAL",
              targetId: r.goalId,
              actorId: userId,
              changes: { originalReason: r.failureReason, reason: "SYSTEM_ASSIGNED" },
              groupId: data.groupId,
              source: "SYSTEM",
              reason: "Repeated Excuse Throttling"
            }
          });

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

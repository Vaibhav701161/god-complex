import { prisma } from "@god-complex/prisma";

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

  await prisma.$transaction(
    results.map((r) => {
      if (r.status === "FAILED" && !r.failureReason) {
        throw new Error("Failure reason required");
      }

      return prisma.goalResult.create({
        data: {
          goal : {connect:{id:r.goalId}},
          user : {connect: {id: userId}},
          status: r.status,
          failureReason: r.failureReason,
        },
      });
    })
  );
}

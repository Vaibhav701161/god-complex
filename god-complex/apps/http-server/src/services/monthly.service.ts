import {prisma} from "@god-complex/prisma";

export async function closeMonth(groupId:string,month:string){
  const existing =await prisma.monthlyOutcome.findFirst({
    where:{groupId,month},
  });

  if(existing){
    throw new Error("month already closed");
  }

 const goals = await prisma.goal.findMany({
  where:{
    groupId,
    date:{
      gte: new Date(`${month}-01`),
      lt:new Date(`${month}-31`),
    },
  },
  include :{result:true},
 });

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

const finalScores = Object.entries(userDayMap).map(
  ([userId, days]) => {
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
  }
);

const ranked = finalScores.sort(
  (a, b) => b.finalScore - a.finalScore
);

  await prisma.$transaction(
    ranked.map((userScore, index) =>
      prisma.monthlyOutcome.create({
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
        },
      })
    )
  );
}

export async function getMonthlyResult(groupId: string, month: string) {
  return [];
}
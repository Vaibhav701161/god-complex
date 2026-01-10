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

 const scores: Record<string,number> = {};

 for(const g of goals){
  if(!scores[g.userId]) scores[g.userId] =0;
  if(!g.result) continue;

  if (g.result.status === "COMPLETED") scores[g.userId] += 1;
  if (g.result.status === "MIN_EFFORT") scores[g.userId] += 0.5;
 }

 const ranked = Object.entries(scores).sort((a,b) =>b[1] - a[1]);

  await prisma.$transaction(
    ranked.map(([userId, score], index) =>
      prisma.monthlyOutcome.create({
        data: {
          userId,
          groupId,
          month,
          finalScore: score,
          rank: index + 1,
          averageDailyScore: score, // refine later
          activeDays: 0,
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

import {prisma} from "@god-complex/prisma";
import { assertMembership } from "@/lib/guards";
import { getWeekRange } from "@/lib/time";

export async function getLeaderboard(
  groupId:string,
  userId:string,
  month:string
){
  await assertMembership(userId, groupId, month);
  const goals = await prisma.goal.findMany({
    where: {groupId},
    include: {result:true},
  });

  const userScores: Record<string, {total:number;days:number}> = {};

  for (const g of goals){
    if(!userScores[g.userId]){
      userScores[g.userId] = {total: 0, days: 0};
    }

    if(g.result){
      let score = 0;
      if(g.result.status === "COMPLETED") score =1;
      if(g.result.status === "MIN_EFFORT") score= 0.5;
      userScores[g.userId].total +=score;
      userScores[g.userId].days += 1;
    }
  }

  return Object.entries(userScores)
  .map(([userId , s]) =>({
    userId,
    score: s.total / Math.max(s.days,1),
  }))
  .sort((a,b)=> b.score -a.score);

}

export async function getWeeklyDiscomfortStatus(
  userId:string,
  groupId:string,
  date:string
){
  const {start,end} = getWeekRange(date);

  const uncomfortableCount = await prisma.goal.count({
    where:{
      userId,
      groupId,
      isUncomfortable:true,
      date:{
        gte:start,
        lte:end,
      },
    },
  });
  return {
    required:1,
    completed:uncomfortableCount,
    atRisk:uncomfortableCount === 0,
  };
}

export async function getExcuseStats(
  userId:string,
  groupId:string
){
  const since = new Date();
  since.setUTCDate(since.getUTCDate()-7);

  const results = await prisma.goalResult.findMany({
    where:{
      goal:{
        userId,
        groupId,
        date: {gte:since},
      },
      failureReason:{not:null},
    },
    select:{failureReason:true},
  });

  const stats: Record<string,number>= {};

  for (const r of results){
    const reason = r.failureReason!;
    stats[reason] = (stats[reason] || 0) +1;
  }

  return stats;
}

export async function getUserDailyHistory(
  userId:string,
  groupId:string,
  date:string
){
  const goals = await prisma.goal.findMany({
    where:{
      userId,
      groupId,
      date: new Date(date),
    },
    include:{
      result:true,
    },
  });

  return goals.map(g=> ({
    goalId: g.id,
    title:g.title,
    isUncomfortable: g.isUncomfortable,
    status: g.result?.failureReason ?? null,
  }));
}

export async function getUserWeeklySummary(
  userId:string,
  groupId:string,
  date:string,
){
  const {start,end} = getWeekRange(date);

  const goals = await prisma.goal.findMany({
    where:{
      userId,
      groupId,
      date: {gte:start,lte:end},
    },
    include:{result:true},
  });

  let completed = 0;
  let minEffort = 0;
  let failed = 0 ;
  let uncomfortableCount = 0 ;

  for(const g of goals){
    if(g.isUncomfortable) uncomfortableCount++;

    if(!g.result) continue;
    if(g.result.status === "COMPLETED") completed++;
    if(g.result.status === "MIN_EFFORT") minEffort++;
    if(g.result.status === "FAILED") failed++;
  }

  return {
    completed,
    minEffort,
    failed,
    uncomfortableCount,
    discomfortAtRisk: uncomfortableCount === 0,
  };
}

export async function getGroupMonthlyHistory(
  groupId: string,
  month: string
) {
  return prisma.monthlyOutcome.findMany({
    where: { groupId, month },
    orderBy: { rank: "asc" },
    select: {
      userId: true,
      rank: true,
      finalScore: true,
      averageDailyScore: true,
      activeDays: true,
      payoutAmount: true,
      penaltyAmount: true,
    },
  });
}

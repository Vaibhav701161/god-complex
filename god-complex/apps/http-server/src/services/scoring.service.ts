import {prisma} from "@god-complex/prisma";

export async function getLeaderboard(groupId:string){
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
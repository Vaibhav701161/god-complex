import {prisma} from "@god-complex/prisma";
import {getMonth,getWeekRange,isBeforeCutoff} from "../lib/time";

interface DailyGoalInput{
    groupId:string,
    date: string,
    goals: {
        title:string;
        category:any;
        finishCondition: string;
        minEffort:string;
        isUncomfortable:boolean;
    }[];
}

export async function submitDailyGoals(
  userId: string,
  data: DailyGoalInput
) {
  const { groupId, date, goals } = data;

  
  const group = await prisma.group.findUnique({where:{id:groupId}});
  if(!group) throw new Error("Group not found");
  if(!isBeforeCutoff(group.cutoffHour)){
    throw new Error("Daily goal cutoff passed");
  }


  if (goals.length === 0) {
    throw new Error("At least one goal required");
  }

  const month = getMonth(date);

  
  const membership = await prisma.membership.findUnique({
    where: {
      userId_groupId_month: {
        userId,
        groupId,
        month,
      },
    },
  });

  if (!membership) {
    throw new Error("User not a member for this month");
  }

  const {start,end} = await getWeekRange(date);

  const UncomfortableCount = await prisma.goal.count({
    where:{
        userId,
        groupId,
        isUncomfortable:true,
        date: {
            gte : start,
            lte:end,
        },
    },
  });

  const submittingUncomfortable = goals.some(g => g.isUncomfortable);
  if(UncomfortableCount === 0 && !submittingUncomfortable){
    throw new Error("You must set at least one uncomfortable goal this week to maintain accountability");
  }

  
  const existingGoals = await prisma.goal.findFirst({
    where: { userId, groupId, date: new Date(date) },
  });

  if (existingGoals) {
    throw new Error("Goals already submitted for this day");
  }

  
  await prisma.$transaction(
    goals.map((g) =>
      prisma.goal.create({
        data: {
          userId,
          groupId,
          date: new Date(date),
          title: g.title,
          category: g.category,
          finishCondition: g.finishCondition,
          minEffort: g.minEffort,
          isUncomfortable: g.isUncomfortable,
        },
      })
    )
  );
}
export async function getDailyGoals(groupId:string, date: string){
    return[];
}
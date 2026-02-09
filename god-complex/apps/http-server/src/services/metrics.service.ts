import { prisma } from "@god-complex/prisma";
export interface MetricsResult {
    efficiency: number;
    activeLiabilities: number;
    failureMomentum: number;
    pattern: string | null;
    declarationDelta: number | null;
    metadata: {
        declaredGoals: number;
        completedGoals: number;
        failedGoals: number;
        activeExcuses: number;
        avgDailyGoals7Day: number;
    };
}
export async function getDashboardMetrics(groupId: string, userId: string): Promise<MetricsResult> {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthGoals = await prisma.goal.findMany({
        where: {
            groupId,
            userId,
            date: { gte: currentMonthStart },
        },
        include: { result: true }
    });
    const recentGoals = await prisma.goal.findMany({
        where: {
            groupId,
            userId,
            date: { gte: sevenDaysAgo },
        },
        include: { result: true }
    });
    const completed = monthGoals.filter(g => g.result?.status === 'COMPLETED').length;
    const minEffort = monthGoals.filter(g => g.result?.status === 'MIN_EFFORT').length;
    const totalDeclared = monthGoals.length;
    const efficiency = totalDeclared > 0
        ? ((completed + (0.5 * minEffort)) / totalDeclared) * 100
        : 0;
    const recentFailures = recentGoals.filter(g => g.result?.status === 'FAILED' ||
        (g.result?.status === undefined && g.date < new Date(now.setHours(0, 0, 0, 0)))).length;
    const failureMomentum = recentFailures;
    const activeLiabilities = await prisma.penaltyAssignment.count({
        where: {
            userId,
            groupId,
            status: 'PENDING'
        }
    });
    let pattern: string | null = null;
    if (failureMomentum > 4)
        pattern = "High Failure Rate";
    else if (activeLiabilities > 2)
        pattern = "Penalty Burden";
    else if (failureMomentum > 0 && activeLiabilities === 0)
        pattern = "Silent Failure";
    else if (failureMomentum === 0 && totalDeclared > 5)
        pattern = "Consistent Execution";
    const todayGoalsCount = recentGoals.filter(g => g.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length;
    const goalsByDay = new Map<string, number>();
    recentGoals.forEach(g => {
        const d = g.date.toISOString().split('T')[0];
        if (d !== new Date().toISOString().split('T')[0]) {
            goalsByDay.set(d, (goalsByDay.get(d) || 0) + 1);
        }
    });
    let totalPastGoals = 0;
    goalsByDay.forEach(count => totalPastGoals += count);
    const activeDays = goalsByDay.size || 1;
    const avgDailyGoals = totalPastGoals / activeDays;
    let declarationDelta: number | null = null;
    if (avgDailyGoals > 0) {
        declarationDelta = Math.round(((todayGoalsCount - avgDailyGoals) / avgDailyGoals) * 100);
    }
    return {
        efficiency,
        activeLiabilities,
        failureMomentum,
        pattern,
        declarationDelta,
        metadata: {
            declaredGoals: totalDeclared,
            completedGoals: completed,
            failedGoals: monthGoals.filter(g => g.result?.status === 'FAILED').length,
            activeExcuses: activeLiabilities,
            avgDailyGoals7Day: avgDailyGoals
        }
    };
}

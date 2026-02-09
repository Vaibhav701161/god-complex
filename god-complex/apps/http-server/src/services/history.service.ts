import { prisma } from "@god-complex/prisma";
export async function getMonthlyHistory(groupId: string, month: string) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error("Invalid month format. Expected YYYY-MM");
    }
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    const daysInMonth = endDate.getDate();
    const goals = await prisma.goal.findMany({
        where: {
            groupId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            result: true,
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: [
            { date: 'asc' },
            { createdAt: 'asc' },
        ],
    });
    const finalizations = await prisma.dailyFinalization.findMany({
        where: {
            groupId,
            date: {
                startsWith: month,
            },
        },
        select: {
            date: true,
            status: true,
        },
    });
    const finalizedDates = new Set(finalizations
        .filter(f => f.status === 'FINALIZED')
        .map(f => f.date));
    const dayMap = new Map<number, typeof goals>();
    goals.forEach(goal => {
        const day = goal.date.getDate();
        if (!dayMap.has(day)) {
            dayMap.set(day, []);
        }
        dayMap.get(day)!.push(goal);
    });
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${month}-${day.toString().padStart(2, '0')}`;
        const dayGoals = dayMap.get(day) || [];
        return {
            date: dateStr,
            day,
            finalized: finalizedDates.has(dateStr),
            goals: dayGoals.map(g => ({
                id: g.id,
                userId: g.userId,
                userName: g.user.name,
                title: g.title,
                category: g.category,
                isUncomfortable: g.isUncomfortable,
                status: g.result?.status || null,
                isAutoFail: g.result?.failureReason === 'SYSTEM_ASSIGNED',
                failureReason: g.result?.failureReason || null,
                recordedAt: g.result?.recordedAt || null,
            })),
        };
    });
    return {
        month,
        totalDays: daysInMonth,
        days,
        stats: {
            totalGoals: goals.length,
            completedGoals: goals.filter(g => g.result?.status === 'COMPLETED').length,
            failedGoals: goals.filter(g => g.result?.status === 'FAILED').length,
            autoFailedGoals: goals.filter(g => g.result?.failureReason === 'SYSTEM_ASSIGNED').length,
        },
    };
}

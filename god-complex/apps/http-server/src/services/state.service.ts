import { prisma } from "@god-complex/prisma";
import { resolveGroupDay } from "../lib/time-resolver";
export async function getDailyState(groupId: string, date: string) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
            timezone: true,
            cutoffHour: true,
        },
    });
    if (!group) {
        throw new Error("Group not found");
    }
    const now = new Date();
    const boundaries = resolveGroupDay(now, group.timezone, group.cutoffHour);
    const cutoffPassed = now > boundaries.dayEndUTC;
    const finalization = await prisma.dailyFinalization.findUnique({
        where: {
            groupId_date: { groupId, date },
        },
    });
    if (finalization && finalization.status === "FINALIZED") {
        const goalsCount = await prisma.goal.count({
            where: { groupId, date: new Date(date) },
        });
        const checkinCount = await prisma.goalResult.count({
            where: {
                goal: {
                    groupId,
                    date: new Date(date),
                },
            },
        });
        return {
            date,
            systemMode: "DAY_FINALIZED" as const,
            cutoffPassed: true,
            finalized: true,
            serverTime: now.toISOString(),
            metadata: {
                goalsCount,
                checkinCount,
                cutoffUTC: boundaries.dayEndUTC.toISOString(),
                finalizedAt: finalization.finalizedAt?.toISOString() || null,
            },
        };
    }
    const goalsCount = await prisma.goal.count({
        where: { groupId, date: new Date(date) },
    });
    const checkinCount = await prisma.goalResult.count({
        where: {
            goal: {
                groupId,
                date: new Date(date),
            },
        },
    });
    let systemMode: "DECLARATION_REQUIRED" | "EXECUTION_IN_PROGRESS" | "RESOLUTION_PENDING" | "DAY_FINALIZED";
    if (goalsCount === 0) {
        systemMode = "DECLARATION_REQUIRED";
    }
    else if (checkinCount < goalsCount) {
        systemMode = cutoffPassed ? "RESOLUTION_PENDING" : "EXECUTION_IN_PROGRESS";
    }
    else {
        systemMode = "DAY_FINALIZED";
    }
    return {
        date,
        systemMode,
        cutoffPassed,
        finalized: false,
        serverTime: now.toISOString(),
        metadata: {
            goalsCount,
            checkinCount,
            cutoffUTC: boundaries.dayEndUTC.toISOString(),
            finalizedAt: null,
        },
    };
}

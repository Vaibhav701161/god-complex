import { prisma } from "@god-complex/prisma";
import { resolveGroupDay } from "../lib/time-resolver";

/**
 * GET DAILY SYSTEM STATE
 * 
 * Backend-owned system mode derivation.
 * Frontend should NEVER compute time-based state logic.
 * 
 * This is the single source of truth for what mode the day is in.
 */
export async function getDailyState(groupId: string, date: string) {
    // Fetch group settings
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

    // Server time resolution (authoritative)
    const now = new Date();
    const boundaries = resolveGroupDay(now, group.timezone, group.cutoffHour);
    const cutoffPassed = now > boundaries.dayEndUTC;

    // Check finalization status
    const finalization = await prisma.dailyFinalization.findUnique({
        where: {
            groupId_date: { groupId, date },
        },
    });

    // If day is finalized, that's the final state
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

    // Count goals and checkins
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

    // Derive system mode based on state
    let systemMode: "DECLARATION_REQUIRED" | "EXECUTION_IN_PROGRESS" | "RESOLUTION_PENDING" | "DAY_FINALIZED";

    if (goalsCount === 0) {
        systemMode = "DECLARATION_REQUIRED";
    } else if (checkinCount < goalsCount) {
        systemMode = cutoffPassed ? "RESOLUTION_PENDING" : "EXECUTION_IN_PROGRESS";
    } else {
        // All checked in but not yet finalized
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

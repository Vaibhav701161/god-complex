import { prisma } from "@god-complex/prisma";
import { finalizeDay } from "./daily.service";
import { autoFailOverduePenalties } from "./penalty.service";
import { closeMonth } from "./monthly.service";
import { resolveGroupDay } from "../lib/time-resolver";
export async function runDailyFinalization() {
    console.log("[Orchestration] Starting Daily Finalization...");
    const groups = await prisma.group.findMany();
    for (const group of groups) {
        try {
            await processGroupDaily(group);
        }
        catch (err) {
            console.error(`[Orchestration] Failed to finalize group ${group.id}:`, err);
        }
    }
    console.log("[Orchestration] Daily Finalization Complete.");
}
async function processGroupDaily(group: any) {
    const now = new Date();
    const currentOpDay = resolveGroupDay(now, group.timezone, group.cutoffHour);
    const lastFinalized = await prisma.dailyFinalization.findFirst({
        where: {
            groupId: group.id,
            status: "FINALIZED"
        },
        orderBy: { date: 'desc' }
    });
    let nextDayToFinalize: Date;
    if (!lastFinalized) {
        console.warn(`[Orchestration] No history for group ${group.id}. Finalizing previous day only.`);
        nextDayToFinalize = new Date(currentOpDay.date);
        nextDayToFinalize.setUTCDate(nextDayToFinalize.getUTCDate() - 1);
    }
    else {
        nextDayToFinalize = new Date(lastFinalized.date);
        nextDayToFinalize.setUTCDate(nextDayToFinalize.getUTCDate() + 1);
    }
    let safetyLoop = 0;
    while (safetyLoop < 30) {
        const candidateDateLabel = nextDayToFinalize.toISOString().slice(0, 10);
        if (candidateDateLabel >= currentOpDay.date) {
            break;
        }
        console.log(`[Orchestration] Catch-up finalizing ${candidateDateLabel} for ${group.id}`);
        await finalizeDay(group.id, candidateDateLabel);
        nextDayToFinalize.setUTCDate(nextDayToFinalize.getUTCDate() + 1);
        safetyLoop++;
    }
}
function getPreviousMonth(): string {
    const now = new Date();
    now.setUTCMonth(now.getUTCMonth() - 1);
    return now.toISOString().slice(0, 7);
}
export async function closePreviousMonthForAllGroups() {
    const month = getPreviousMonth();
    console.log(`[Orchestration] Closing month ${month} for all groups...`);
    const groups = await prisma.group.findMany({
        select: { id: true },
    });
    for (const group of groups) {
        try {
            const alreadyClosed = await prisma.monthlyOutcome.findFirst({
                where: {
                    groupId: group.id,
                    month,
                },
            });
            if (alreadyClosed) {
                continue;
            }
            await closeMonth(group.id, month);
        }
        catch (err) {
            console.error(`[Orchestration] Failed to close month for group ${group.id}`, err);
        }
    }
}

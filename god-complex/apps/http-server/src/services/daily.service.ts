import { prisma } from "@god-complex/prisma";
import { resolveGroupDay, getBoundariesForDate } from "../lib/time-resolver";
import { logAudit } from "./audit.service";
export async function finalizeDay(groupId: string, date: string, auditContext: {
    source: "SYSTEM" | "ADMIN" | "CRON";
    reason?: string;
    correlationId?: string;
} = { source: "SYSTEM" }) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { timezone: true, cutoffHour: true }
    });
    if (!group)
        throw new Error("Group not found");
    const now = new Date();
    const boundaries = resolveGroupDay(now, group.timezone, group.cutoffHour);
    const targetBoundaries = getBoundariesForDate(date, group.timezone, group.cutoffHour);
    if (boundaries.date === date) {
        console.warn(`[Finalization] Tentative skip: Current operational day is ${boundaries.date}, requested ${date}.`);
    }
    const existing = await prisma.dailyFinalization.findUnique({
        where: {
            groupId_date: { groupId, date }
        }
    });
    if (existing && existing.status === "FINALIZED") {
        console.log(`[Finalization] Group ${groupId} Date ${date} already finalized.`);
        return;
    }
    return prisma.$transaction(async (tx: any) => {
        const check = await tx.dailyFinalization.findUnique({
            where: { groupId_date: { groupId, date } }
        });
        if (check && check.status === "FINALIZED")
            return;
        const missedGoals = await tx.goal.findMany({
            where: {
                groupId,
                date: new Date(date),
                result: null
            }
        });
        for (const goal of missedGoals) {
            await tx.goalResult.create({
                data: {
                    goalId: goal.id,
                    userId: goal.userId,
                    status: "FAILED",
                    failureReason: "SYSTEM_ASSIGNED"
                }
            });
            await logAudit(tx, "AUTO_FAIL", "GOAL", goal.id, null, { reason: "Missed Deadline" }, groupId, {
                source: auditContext.source as any,
                reason: auditContext.reason || "Daily Finalization Auto-Fail",
                correlationId: auditContext.correlationId
            });
        }
        await tx.goal.updateMany({
            where: { groupId, date: new Date(date) },
            data: { isLocked: true }
        });
        const finalization = await tx.dailyFinalization.create({
            data: {
                groupId,
                date,
                dayStartUTC: targetBoundaries.dayStartUTC,
                dayEndUTC: targetBoundaries.dayEndUTC,
                cutoffUTC: targetBoundaries.dayEndUTC,
                status: "FINALIZED",
                finalizedAt: new Date(),
                metadata: {
                    autoFailedCount: missedGoals.length
                }
            }
        });
        await logAudit(tx, "DAY_FINALIZED", "DAILY_FINALIZATION", finalization.id, null, {
            date,
            autoFailedCount: missedGoals.length,
            dayStartUTC: targetBoundaries.dayStartUTC.toISOString(),
            dayEndUTC: targetBoundaries.dayEndUTC.toISOString()
        }, groupId, {
            source: auditContext.source as any,
            reason: auditContext.reason || "Daily finalization completed",
            correlationId: auditContext.correlationId
        });
        console.log(`[Finalization] Completed for ${groupId} on ${date}. Failed: ${missedGoals.length}`);
    });
}

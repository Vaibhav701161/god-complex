import { Prisma } from "@god-complex/prisma";
import { AuditSource } from "@god-complex/prisma";
type PrismaTx = Omit<Prisma.TransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">;
interface AuditContext {
    source: AuditSource;
    reason?: string;
    correlationId?: string;
}
export async function logAudit(tx: PrismaTx, action: string, targetType: string, targetId: string, actorId: string | null = null, changes: object | null = null, groupId: string | null = null, context: AuditContext = { source: "SYSTEM" }) {
    if (context.source === "ADMIN" && !context.reason) {
        console.warn("[AUDIT] Admin action logged without reason!", action, targetId);
        context.reason = "Unspecified Admin Action";
    }
    await tx.auditLog.create({
        data: {
            action,
            targetType,
            targetId,
            actorId,
            changes: changes as any,
            groupId,
            source: context.source,
            reason: context.reason,
            correlationId: context.correlationId
        }
    });
}

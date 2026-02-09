import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
const router = Router();
const isDevelopment = process.env.NODE_ENV !== "production";
const EXPECTED_TABLES = [
    "user",
    "session",
    "account",
    "verification",
    "Group",
    "Membership",
    "Goal",
    "GoalResult",
    "MonthlyOutcome",
    "PenaltyAssignment",
    "daily_finalization",
    "audit_log",
    "GroupJoinRequest",
];
interface TableCheck {
    table: string;
    exists: boolean;
    count?: number;
    error?: string;
}
interface CrudTestResult {
    model: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    error?: string;
}
interface HealthCheckResponse {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    database: {
        connected: boolean;
        latencyMs: number;
        version?: string;
        error?: string;
    };
    tables: {
        expected: number;
        found: number;
        missing: string[];
        details: TableCheck[];
    };
    crudTests?: {
        user: CrudTestResult;
        group: CrudTestResult;
    };
}
router.get("/", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
        await prisma.user.count();
        const latencyMs = Date.now() - startTime;
        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                latencyMs,
            },
        });
    }
    catch (error) {
        const latencyMs = Date.now() - startTime;
        res.status(503).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            database: {
                connected: false,
                latencyMs,
                error: error instanceof Error ? error.message : "Unknown error",
            },
        });
    }
});
router.get("/detailed", async (req: Request, res: Response) => {
    const startTime = Date.now();
    const response: HealthCheckResponse = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: {
            connected: false,
            latencyMs: 0,
        },
        tables: {
            expected: EXPECTED_TABLES.length,
            found: 0,
            missing: [],
            details: [],
        },
    };
    try {
        const dbStartTime = Date.now();
        await prisma.user.count();
        response.database.connected = true;
        response.database.latencyMs = Date.now() - dbStartTime;
        response.database.version = "PostgreSQL (Neon Serverless)";
        const tableChecks: TableCheck[] = [];
        const tableCounters: Record<string, () => Promise<number>> = {
            user: () => prisma.user.count(),
            session: () => prisma.session.count(),
            account: () => prisma.account.count(),
            verification: () => prisma.verification.count(),
            Group: () => prisma.group.count(),
            Membership: () => prisma.membership.count(),
            Goal: () => prisma.goal.count(),
            GoalResult: () => prisma.goalResult.count(),
            MonthlyOutcome: () => prisma.monthlyOutcome.count(),
            PenaltyAssignment: () => prisma.penaltyAssignment.count(),
            daily_finalization: () => prisma.dailyFinalization.count(),
            audit_log: () => prisma.auditLog.count(),
            GroupJoinRequest: () => prisma.groupJoinRequest.count(),
        };
        for (const table of EXPECTED_TABLES) {
            try {
                const countFn = tableCounters[table];
                if (countFn) {
                    const count = await countFn();
                    tableChecks.push({
                        table,
                        exists: true,
                        count,
                    });
                }
                else {
                    tableChecks.push({
                        table,
                        exists: false,
                        error: "No Prisma model mapping found",
                    });
                    response.tables.missing.push(table);
                }
            }
            catch (error) {
                tableChecks.push({
                    table,
                    exists: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
                response.tables.missing.push(table);
            }
        }
        response.tables.details = tableChecks;
        response.tables.found = tableChecks.filter(t => t.exists).length;
        if (response.tables.missing.length > 0) {
            response.status = "degraded";
        }
    }
    catch (error) {
        response.database.error = error instanceof Error ? error.message : "Unknown error";
        response.status = "unhealthy";
    }
    response.database.latencyMs = Date.now() - startTime;
    const statusCode = response.status === "healthy" ? 200 :
        response.status === "degraded" ? 200 : 503;
    res.status(statusCode).json(response);
});
router.get("/crud-test", async (req: Request, res: Response) => {
    if (!isDevelopment) {
        res.status(403).json({
            status: "forbidden",
            message: "CRUD tests are disabled in production environment",
            hint: "Set NODE_ENV to 'development' or 'test' to enable this endpoint",
        });
        return;
    }
    const timestamp = Date.now();
    const testEmail = `health-test-${timestamp}@test.local`;
    const testGroupName = `health-test-group-${timestamp}`;
    const results: HealthCheckResponse["crudTests"] = {
        user: { model: "User", create: false, read: false, update: false, delete: false },
        group: { model: "Group", create: false, read: false, update: false, delete: false },
    };
    let testUserId: string | null = null;
    let testGroupId: string | null = null;
    try {
        try {
            const user = await prisma.user.create({
                data: {
                    email: testEmail,
                    name: "Health Check Test User",
                    emailVerified: false,
                },
            });
            testUserId = user.id;
            results.user.create = true;
            const readUser = await prisma.user.findUnique({
                where: { id: testUserId },
            });
            results.user.read = readUser !== null;
            const updatedUser = await prisma.user.update({
                where: { id: testUserId },
                data: { displayName: "Updated Health Check User" },
            });
            results.user.update = updatedUser.displayName === "Updated Health Check User";
            await prisma.user.delete({
                where: { id: testUserId },
            });
            const deletedUser = await prisma.user.findUnique({
                where: { id: testUserId },
            });
            results.user.delete = deletedUser === null;
            testUserId = null;
        }
        catch (error) {
            results.user.error = error instanceof Error ? error.message : "Unknown error";
        }
        try {
            const group = await prisma.group.create({
                data: {
                    name: testGroupName,
                    monthlyPledge: 100,
                    cutoffHour: 22,
                    timezone: "UTC",
                },
            });
            testGroupId = group.id;
            results.group.create = true;
            const readGroup = await prisma.group.findUnique({
                where: { id: testGroupId },
            });
            results.group.read = readGroup !== null;
            const updatedGroup = await prisma.group.update({
                where: { id: testGroupId },
                data: { name: `${testGroupName}-updated` },
            });
            results.group.update = updatedGroup.name === `${testGroupName}-updated`;
            await prisma.group.delete({
                where: { id: testGroupId },
            });
            const deletedGroup = await prisma.group.findUnique({
                where: { id: testGroupId },
            });
            results.group.delete = deletedGroup === null;
            testGroupId = null;
        }
        catch (error) {
            results.group.error = error instanceof Error ? error.message : "Unknown error";
        }
    }
    finally {
        if (testUserId) {
            try {
                await prisma.user.delete({ where: { id: testUserId } });
            }
            catch {
            }
        }
        if (testGroupId) {
            try {
                await prisma.group.delete({ where: { id: testGroupId } });
            }
            catch {
            }
        }
    }
    const allUserPassed = results.user.create && results.user.read && results.user.update && results.user.delete;
    const allGroupPassed = results.group.create && results.group.read && results.group.update && results.group.delete;
    const status = allUserPassed && allGroupPassed ? "healthy" : "degraded";
    res.status(status === "healthy" ? 200 : 500).json({
        status,
        timestamp: new Date().toISOString(),
        crudTests: results,
        summary: {
            userCrud: allUserPassed ? "PASS" : "FAIL",
            groupCrud: allGroupPassed ? "PASS" : "FAIL",
        },
    });
});
const TABLE_MODEL_MAP: Record<string, () => Promise<number>> = {
    user: () => prisma.user.count(),
    session: () => prisma.session.count(),
    account: () => prisma.account.count(),
    verification: () => prisma.verification.count(),
    Group: () => prisma.group.count(),
    Membership: () => prisma.membership.count(),
    Goal: () => prisma.goal.count(),
    GoalResult: () => prisma.goalResult.count(),
    MonthlyOutcome: () => prisma.monthlyOutcome.count(),
    PenaltyAssignment: () => prisma.penaltyAssignment.count(),
    daily_finalization: () => prisma.dailyFinalization.count(),
    audit_log: () => prisma.auditLog.count(),
    GroupJoinRequest: () => prisma.groupJoinRequest.count(),
};
router.get("/tables", async (req: Request, res: Response) => {
    try {
        const tableInfo: Array<{
            name: string;
            rowCount: number;
            error?: string;
        }> = [];
        for (const [tableName, countFn] of Object.entries(TABLE_MODEL_MAP)) {
            try {
                const count = await countFn();
                tableInfo.push({
                    name: tableName,
                    rowCount: count,
                });
            }
            catch (error) {
                tableInfo.push({
                    name: tableName,
                    rowCount: -1,
                    error: error instanceof Error ? error.message : "Could not count rows",
                });
            }
        }
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            totalTables: tableInfo.length,
            tables: tableInfo,
        });
    }
    catch (error) {
        res.status(503).json({
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
export default router;

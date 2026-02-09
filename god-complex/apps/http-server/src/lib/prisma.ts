import "dotenv/config";
import { prisma } from "@god-complex/prisma";
export { prisma };
export async function validateDatabaseConnection(failFast: boolean = false): Promise<boolean> {
    const startTime = Date.now();
    try {
        await prisma.user.count();
        const latencyMs = Date.now() - startTime;
        console.log(`[PRISMA]  Database connection validated (${latencyMs}ms)`);
        return true;
    }
    catch (error) {
        const latencyMs = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        if (failFast) {
            console.error(`[PRISMA]  Database connection failed (${latencyMs}ms): ${errorMessage}`);
            throw new Error(`Database connection failed: ${errorMessage}`);
        }
        else {
            console.warn(`[PRISMA] ️ Database connection check failed (${latencyMs}ms): ${errorMessage}`);
            console.warn("[PRISMA] Server will start but database operations may fail");
            return false;
        }
    }
}
export async function disconnectDatabase(): Promise<void> {
    try {
        await prisma.$disconnect();
        console.log("[PRISMA] Database disconnected");
    }
    catch (error) {
        console.error("[PRISMA] Error disconnecting from database:", error);
    }
}

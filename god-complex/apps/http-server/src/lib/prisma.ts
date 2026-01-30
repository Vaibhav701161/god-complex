import "dotenv/config";
import { prisma } from "@god-complex/prisma";

// Re-export the configured prisma client from the shared package
// The package handles PG adapter configuration for Neon/serverless PostgreSQL
export { prisma };

/**
 * Database connectivity check - validates the database connection at startup.
 * This should be called once during server initialization, not per-request.
 * 
 * @param failFast - If true, throws an error on connection failure. If false, logs warning and continues.
 * @throws Error if database connection fails and failFast is true
 */
export async function validateDatabaseConnection(failFast: boolean = false): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    // Lightweight connectivity check using a simple count query
    await prisma.user.count();
    const latencyMs = Date.now() - startTime;
    console.log(`[PRISMA] ✅ Database connection validated (${latencyMs}ms)`);
    return true;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (failFast) {
      console.error(`[PRISMA] ❌ Database connection failed (${latencyMs}ms): ${errorMessage}`);
      throw new Error(`Database connection failed: ${errorMessage}`);
    } else {
      console.warn(`[PRISMA] ⚠️ Database connection check failed (${latencyMs}ms): ${errorMessage}`);
      console.warn("[PRISMA] Server will start but database operations may fail");
      return false;
    }
  }
}

/**
 * Gracefully disconnect from the database.
 * Should be called during server shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("[PRISMA] Database disconnected");
  } catch (error) {
    console.error("[PRISMA] Error disconnecting from database:", error);
  }
}

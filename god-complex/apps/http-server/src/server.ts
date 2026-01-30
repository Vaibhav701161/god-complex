import "dotenv/config";
import app from "./app";
import { validateDatabaseConnection, disconnectDatabase } from "./lib/prisma";
import {
  startDailyCron,
  startMonthlyCron,
} from "./cron";

const PORT = process.env.PORT || 4000;

/**
 * Start the server with database connectivity validation
 */
async function startServer() {
  try {
    // Validate database connection before starting the server
    // Set REQUIRE_DB_CONNECTION=true to fail fast if database is unavailable
    const requireDbConnection = process.env.REQUIRE_DB_CONNECTION === "true";
    await validateDatabaseConnection(requireDbConnection);
    
    const server = app.listen(PORT, () => {
      console.log(`HTTP server running on port ${PORT}`);
    });

    // Start cron jobs if enabled
    if (process.env.ENABLE_CRON === "true") {
      console.log("[CRON] Starting scheduled jobs");
      startDailyCron();
      startMonthlyCron();
    }

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      console.log(`\n[SERVER] ${signal} received, shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log("[SERVER] Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    console.error("[SERVER] Failed to start:", error);
    process.exit(1);
  }
}

startServer();
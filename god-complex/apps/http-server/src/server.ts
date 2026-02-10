if (process.env.NODE_ENV !== "production") {
    require("dotenv/config");
}
import app from "./app";
import { validateDatabaseConnection, disconnectDatabase } from "./lib/prisma";
import { startDailyCron, startMonthlyCron, } from "./cron";
const PORT = process.env.PORT || 4000;
async function startServer() {
    try {
        const requireDbConnection = process.env.REQUIRE_DB_CONNECTION === "true";
        await validateDatabaseConnection(requireDbConnection);
        const server = app.listen(PORT, () => {
            console.log(`HTTP server running on port ${PORT}`);
        });
        if (process.env.ENABLE_CRON === "true") {
            console.log("[CRON] Starting scheduled jobs");
            startDailyCron();
            startMonthlyCron();
        }
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
    }
    catch (error) {
        console.error("[SERVER] Failed to start:", error);
        process.exit(1);
    }
}
startServer();

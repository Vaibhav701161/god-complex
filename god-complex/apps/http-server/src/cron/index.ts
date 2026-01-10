import cron from "node-cron";
import { runDailyFinalization } from "../services/orchestration.service";
import { autoFailOverduePenalties } from "../services/penalty.service";
import { closeMonth } from "../services/monthly.service";
import { closePreviousMonthForAllGroups } from "../services/orchestration.service";

const IS_PROD = process.env.NODE_ENV === "production";

/**
 * DAILY JOB
 * Runs every day at 23:59 UTC
 * - Auto-fail missed check-ins
 * - Auto-fail overdue penalties
 */
export function startDailyCron() {
  cron.schedule(
    "59 23 * * *",
    async () => {
      console.log("[CRON] Daily finalization started");

      try {
        await runDailyFinalization();
        await autoFailOverduePenalties();
      } catch (err) {
        console.error("[CRON] Daily finalization failed", err);
      }
    },
    { timezone: "UTC" }
  );
}

/**
 * MONTHLY JOB
 * Runs on 1st of every month at 00:10 UTC
 * - Closes previous month for all groups
 */
export function startMonthlyCron() {
  cron.schedule(
    "10 0 1 * *",
    async () => {
      console.log("[CRON] Monthly close started");

      try {
        await closePreviousMonthForAllGroups();
      } catch (err) {
        console.error("[CRON] Monthly close failed", err);
      }
    },
    { timezone: "UTC" }
  );
}

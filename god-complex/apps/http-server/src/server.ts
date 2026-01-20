import "dotenv/config";
import app from "./app";
import {
  startDailyCron,
  startMonthlyCron,
} from "./cron";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});


if (process.env.ENABLE_CRON === "true") {
  console.log("[CRON] Starting scheduled jobs");
  startDailyCron();
  startMonthlyCron();
}
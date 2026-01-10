import { autoFailMissedCheckins } from "./checkin.service";
import { getTodayDate } from "@/lib/time";

export async function runDailyFinalization(){
    const today = getTodayDate();
    await autoFailMissedCheckins(today);
}
import { autoFailMissedCheckins } from "./checkin.service";
import { getTodayDate } from "@/lib/time";
import { prisma } from "@god-complex/prisma";
import { closeMonth } from "./monthly.service";

export async function runDailyFinalization(){
    const today = getTodayDate();
    await autoFailMissedCheckins(today);
}

function getPreviousMonth(): string {
  const now = new Date();
  now.setUTCMonth(now.getUTCMonth() - 1);
  return now.toISOString().slice(0, 7);
}

export async function closePreviousMonthForAllGroups() {
  const month = getPreviousMonth();

  const groups = await prisma.group.findMany({
    select: { id: true },
  });

  for (const group of groups) {
    const alreadyClosed = await prisma.monthlyOutcome.findFirst({
      where: {
        groupId: group.id,
        month,
      },
    });

    if (alreadyClosed) {
      continue; // idempotency guarantee
    }

    await closeMonth(group.id, month);
  }
}
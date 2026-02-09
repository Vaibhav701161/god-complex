export interface DayBoundaries {
    date: string;
    dayStartUTC: Date;
    dayEndUTC: Date;
}
export function resolveGroupDay(nowUTC: Date, timezone: string, cutoffHour: number): DayBoundaries {
    const parts = getLocalParts(nowUTC, timezone);
    let opYear = parts.year;
    let opMonth = parts.month;
    let opDay = parts.day;
    if (parts.hour < cutoffHour) {
        const d = new Date(Date.UTC(opYear, opMonth - 1, opDay));
        d.setUTCDate(d.getUTCDate() - 1);
        opYear = d.getUTCFullYear();
        opMonth = d.getUTCMonth() + 1;
        opDay = d.getUTCDate();
    }
    const dateStr = `${opYear}-${String(opMonth).padStart(2, '0')}-${String(opDay).padStart(2, '0')}`;
    const dayStartUTC = getUtcFromLocal(timezone, opYear, opMonth, opDay, cutoffHour);
    const endD = new Date(Date.UTC(opYear, opMonth - 1, opDay));
    endD.setUTCDate(endD.getUTCDate() + 1);
    const endYear = endD.getUTCFullYear();
    const endMonth = endD.getUTCMonth() + 1;
    const endDay = endD.getUTCDate();
    const dayEndUTC = getUtcFromLocal(timezone, endYear, endMonth, endDay, cutoffHour);
    return {
        date: dateStr,
        dayStartUTC,
        dayEndUTC
    };
}
export function getBoundariesForDate(dateLabel: string, timezone: string, cutoffHour: number): Omit<DayBoundaries, 'date'> {
    const [y, m, d] = dateLabel.split('-').map(Number);
    const dayStartUTC = getUtcFromLocal(timezone, y, m, d, cutoffHour);
    const endD = new Date(Date.UTC(y, m - 1, d + 1));
    const endYear = endD.getUTCFullYear();
    const endMonth = endD.getUTCMonth() + 1;
    const endDay = endD.getUTCDate();
    const dayEndUTC = getUtcFromLocal(timezone, endYear, endMonth, endDay, cutoffHour);
    return { dayStartUTC, dayEndUTC };
}
function getLocalParts(date: Date, timezone: string) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(date);
    const get = (t: string) => parts.find(p => p.type === t)!.value;
    return {
        year: parseInt(get('year')),
        month: parseInt(get('month')),
        day: parseInt(get('day')),
        hour: parseInt(get('hour') === '24' ? '0' : get('hour')),
        minute: parseInt(get('minute'))
    };
}
function getUtcFromLocal(timezone: string, year: number, month: number, day: number, hour: number): Date {
    let guess = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
    for (let i = 0; i < 4; i++) {
        const local = getLocalParts(guess, timezone);
        const targetTimeValue = Date.UTC(year, month - 1, day, hour, 0, 0);
        const obtainedTimeValue = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, 0);
        const diff = targetTimeValue - obtainedTimeValue;
        if (Math.abs(diff) < 1000)
            return guess;
        guess = new Date(guess.getTime() + diff);
    }
    return guess;
}

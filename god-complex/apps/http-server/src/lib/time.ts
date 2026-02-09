export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}
export function getMonth(date: string): string {
    return date.slice(0, 7);
}
export function isBeforeCutoff(cutoffHour: number): boolean {
    const now = new Date();
    return now.getUTCHours() < cutoffHour;
}
export function IsBeforeGroupCutoff(cutoffHour: number): boolean {
    const now = new Date();
    return now.getUTCHours() < cutoffHour;
}
export function getWeekRange(date: string) {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setUTCDate(diff));
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    return { start, end };
}

export function getWeekRange(date: Date): {
    start: Date;
    end: Date;
} {
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
}
export function getDayName(dayOfWeek: number): string {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[dayOfWeek];
}
export function getWeekNumber(date: Date): number {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
}
export function getDaysInMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    return new Date(year, monthNum, 0).getDate();
}
export function calculateFailureThresholdDay(history: Map<number, any>, totalDays: number, requiredScore: number, maxDailyScore: number = 10): number | null {
    let cumulativeScore = 0;
    for (let day = 1; day <= totalDays; day++) {
        const dayEntry = history.get(day);
        if (dayEntry) {
            const completedGoals = dayEntry.goals.filter((g: any) => g.status === 'completed').length;
            const dayScore = completedGoals * maxDailyScore;
            cumulativeScore += dayScore;
        }
        const remainingDays = totalDays - day;
        const maxPossibleScore = cumulativeScore + (remainingDays * maxDailyScore);
        if (maxPossibleScore < requiredScore) {
            return day;
        }
    }
    return null;
}
export function formatDateRange(startDay: number, endDay: number, month: string): string {
    const [year, monthNum] = month.split('-').map(Number);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthName = monthNames[monthNum - 1];
    return `${monthName} ${startDay} – ${monthName} ${endDay}`;
}
export function formatMonth(month: string): string {
    const [year, monthNum] = month.split('-').map(Number);
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return `${monthNames[monthNum - 1]} ${year}`;
}

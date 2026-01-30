/**
 * Step 4: Date Utility Functions
 * 
 * Helper functions for date calculations in review pages
 */

/**
 * Get week range for a given date (Monday to Sunday)
 * Returns Date objects for start and end of week
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Monday of current week (adjust for Sunday = 0)
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + mondayOffset);
    
    // Sunday is 6 days after Monday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return { start: monday, end: sunday };
}

/**
 * Get day name abbreviation from day of week number (0-6)
 */
export function getDayName(dayOfWeek: number): string {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[dayOfWeek];
}

/**
 * Get week number within month
 */
export function getWeekNumber(date: Date): number {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
}

/**
 * Get total days in a given month (YYYY-MM format)
 */
export function getDaysInMonth(month: string): number {
    const [year, monthNum] = month.split('-').map(Number);
    return new Date(year, monthNum, 0).getDate();
}

/**
 * Calculate the day when failure became irreversible
 * Returns null if recovery is still possible
 */
export function calculateFailureThresholdDay(
    history: Map<number, any>,
    totalDays: number,
    requiredScore: number,
    maxDailyScore: number = 10
): number | null {
    let cumulativeScore = 0;
    
    for (let day = 1; day <= totalDays; day++) {
        const dayEntry = history.get(day);
        
        // Add day's score (if exists)
        if (dayEntry) {
            const completedGoals = dayEntry.goals.filter((g: any) => g.status === 'completed').length;
            const dayScore = completedGoals * maxDailyScore;
            cumulativeScore += dayScore;
        }
        
        // Calculate if recovery is still possible
        const remainingDays = totalDays - day;
        const maxPossibleScore = cumulativeScore + (remainingDays * maxDailyScore);
        
        // If max possible score can't reach required score, this is the threshold day
        if (maxPossibleScore < requiredScore) {
            return day;
        }
    }
    
    return null; // Recovery still possible
}

/**
 * Format date range string (e.g., "JAN 15 – JAN 21")
 */
export function formatDateRange(startDay: number, endDay: number, month: string): string {
    const [year, monthNum] = month.split('-').map(Number);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthName = monthNames[monthNum - 1];
    
    return `${monthName} ${startDay} – ${monthName} ${endDay}`;
}

/**
 * Format month string (e.g., "JANUARY 2026")
 */
export function formatMonth(month: string): string {
    const [year, monthNum] = month.split('-').map(Number);
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return `${monthNames[monthNum - 1]} ${year}`;
}

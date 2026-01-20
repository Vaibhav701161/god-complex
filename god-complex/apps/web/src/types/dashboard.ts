// Dashboard-specific types derived from backend data structures

export type SystemMode =
    | 'DECLARATION_REQUIRED'
    | 'EXECUTION_IN_PROGRESS'
    | 'RESOLUTION_PENDING'
    | 'DAY_FINALIZED';

export type DailyStatus =
    | 'completed'
    | 'min_effort'
    | 'failed'
    | 'pending'
    | 'locked'
    | 'auto-fail'
    | 'none';

export interface Goal {
    id: string;
    title: string;
    category: string;
    finishCondition: string;
    minEffort: string;
    isUncomfortable: boolean;
    isLocked: boolean;
    date: string;
    result?: GoalResult;
}

export interface GoalResult {
    id: string;
    status: 'COMPLETED' | 'MIN_EFFORT' | 'FAILED';
    failureReason?: string;
    recordedAt: string;
}

export interface LeaderboardEntry {
    userId: string;
    name: string;
    score: number;
    rank: number;
    recentFailures?: FailureDetail[];
}

export interface FailureDetail {
    date: string;
    goalTitle: string;
    reason: string;
}

export interface DashboardMetrics {
    efficiency: number; // 0-100
    excuseDebt: number; // count of active liabilities
    failureMomentum: number; // recent failure trend
    pattern?: string | null; // e.g., "Inconsistent Execution"
    declarationDelta?: number | null;
}

export interface DayHistoryEntry {
    date: string;
    goals: Array<{
        goalId: string;
        title: string;
        status: DailyStatus;
    }>;
}

export interface MonthlyProjection {
    userId: string;
    score: number;
    averageDailyScore?: number;
    activeDays?: number;
}

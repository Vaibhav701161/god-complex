// Dashboard-specific types derived from backend data structures

export type SystemMode =
    | 'DECLARATION_REQUIRED'
    | 'EXECUTION_IN_PROGRESS'
    | 'RESOLUTION_PENDING'
    | 'DAY_FINALIZED'
    | 'AUTO_FAILED'; // Added to handle aggregate mode edge case

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

// --- Group Types ---

export interface Group {
    id: string;
    name: string;
    monthlyPledge: number;
    cutoffHour: number;
    timezone: string;
    creatorId: string;
    memberCount?: number;
    creator?: {
        id: string;
        name: string;
        displayName?: string;
    };
    memberships?: Membership[];
}

export interface Membership {
    userId: string;
    groupId: string;
    month: string;
    joinedAt?: string;
    user?: {
        id: string;
        name: string;
        displayName?: string;
    };
    group?: Group;
}

export interface GroupJoinRequest {
    id: string;
    groupId: string;
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface CreateGroupInput {
    name: string;
    monthlyPledge: number;
    cutoffHour: number;
    timezone: string;
}

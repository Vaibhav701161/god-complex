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
    activeLiabilities: number; // count of PENDING penalties
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

// --- Penalty Types ---

export type PenaltyStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'APPEALED' | 'RESOLVED';
export type PenaltyVerdict = 'UPHELD' | 'REVERSED';

export interface PenaltyAssignment {
    id: string;
    userId: string;
    groupId: string;
    month: string;
    penaltyType: string;
    dueDate: string;
    status: PenaltyStatus;
    appealReason?: string;
    resolutionNotes?: string;
    verdict?: PenaltyVerdict;
    resolvedAt?: string;
    createdAt: string;
    completedAt?: string;
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

export type AuditSource = 'SYSTEM' | 'CRON' | 'ADMIN' | 'USER';

export interface AuditLogEntry {
    id: string;
    action: string;
    actorId: string | null;
    targetId: string;
    targetType: string;
    changes: Record<string, any> | null;
    createdAt: string;
    source: AuditSource;
    reason: string | null;
    correlationId: string | null;
    groupId: string | null;
}

export interface AuditLogFilters {
    action?: string;
    source?: AuditSource;
    startDate?: string;
    endDate?: string;
    correlationId?: string;
}

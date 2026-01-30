-- System Invariants Verification Queries
-- Run these after executing the test suite to verify system integrity

-- 1. Attribution: Every user action has an actor
-- Should return 0 rows
SELECT COUNT(*) as unattributed_user_actions 
FROM "audit_log" 
WHERE "actorId" IS NULL AND source = 'USER';

-- 2. Evaluability: Every goal has a result after finalization
-- Should return 0 for finalized days
SELECT COUNT(*) as unevaluated_goals
FROM "Goal" g
LEFT JOIN "GoalResult" gr ON g.id = gr."goalId"
WHERE g.date < CURRENT_DATE AND gr.id IS NULL;

-- 3. Explainability: Every failure has a reason
-- Should return 0
SELECT COUNT(*) as unexplained_failures
FROM "GoalResult" 
WHERE status = 'FAILED' AND "failureReason" IS NULL;

-- 4. Immutability: No unauthorized retroactive changes to outcomes
-- Should be empty (only admin can modify outcomes)
SELECT * FROM "audit_log" 
WHERE action LIKE '%UPDATE%' AND "targetType" = 'MonthlyOutcome'
AND source != 'ADMIN';

-- 5. Verify all finalization records have audit trails
SELECT df.id, df."groupId", df.date, 
       (SELECT COUNT(*) FROM "audit_log" al 
        WHERE al."targetId" = df.id::text 
        AND al.action = 'DAY_FINALIZED') as audit_count
FROM "daily_finalization" df
HAVING audit_count = 0;

-- 6. Check for orphaned records
-- Goals without users
SELECT COUNT(*) as orphaned_goals
FROM "Goal" g
LEFT JOIN "user" u ON g."userId" = u.id
WHERE u.id IS NULL;

-- GoalResults without goals
SELECT COUNT(*) as orphaned_results
FROM "GoalResult" gr
LEFT JOIN "Goal" g ON gr."goalId" = g.id
WHERE g.id IS NULL;

-- Memberships without users or groups
SELECT COUNT(*) as orphaned_memberships
FROM "Membership" m
LEFT JOIN "user" u ON m."userId" = u.id
LEFT JOIN "Group" g ON m."groupId" = g.id
WHERE u.id IS NULL OR g.id IS NULL;

-- 7. Verify penalty chain integrity
SELECT pa.id, pa."userId", pa.status, pa."dueDate",
       (SELECT COUNT(*) FROM "audit_log" al 
        WHERE al."targetId" = pa.id::text) as audit_trail_count
FROM "PenaltyAssignment" pa
ORDER BY pa."createdAt" DESC;

-- 8. Summary of system state
SELECT 'Users' as entity, COUNT(*) as count FROM "user"
UNION ALL
SELECT 'Groups', COUNT(*) FROM "Group"
UNION ALL
SELECT 'Memberships', COUNT(*) FROM "Membership"
UNION ALL
SELECT 'Goals', COUNT(*) FROM "Goal"
UNION ALL
SELECT 'GoalResults', COUNT(*) FROM "GoalResult"
UNION ALL
SELECT 'DailyFinalizations', COUNT(*) FROM "daily_finalization"
UNION ALL
SELECT 'MonthlyOutcomes', COUNT(*) FROM "MonthlyOutcome"
UNION ALL
SELECT 'PenaltyAssignments', COUNT(*) FROM "PenaltyAssignment"
UNION ALL
SELECT 'AuditLogs', COUNT(*) FROM "audit_log";

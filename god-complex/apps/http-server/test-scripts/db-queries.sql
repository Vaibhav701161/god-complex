-- Verify user creation
SELECT id, email, name, "emailVerified", "applicationDone" FROM "user" ORDER BY "createdAt" DESC LIMIT 5;

-- Check group memberships
SELECT m.id, u.email, g.name, m.month, m."joinedAt" 
FROM "Membership" m
JOIN "user" u ON m."userId" = u.id
JOIN "Group" g ON m."groupId" = g.id
ORDER BY m."joinedAt" DESC;

-- View daily goals with results
SELECT g.id, g.title, g.category, g."isUncomfortable", g."isLocked", 
       gr.status, gr."failureReason"
FROM "Goal" g
LEFT JOIN "GoalResult" gr ON g.id = gr."goalId"
WHERE g.date = CURRENT_DATE
ORDER BY g."createdAt" DESC;

-- Check penalty assignments
SELECT pa.id, u.email, g.name, pa."penaltyType", pa.status, pa."dueDate", pa.verdict
FROM "PenaltyAssignment" pa
JOIN "user" u ON pa."userId" = u.id
JOIN "Group" g ON pa."groupId" = g.id
ORDER BY pa."createdAt" DESC;

-- View audit log for excuse rejections
SELECT * FROM "audit_log" 
WHERE action = 'EXCUSE_REJECTED' 
ORDER BY "createdAt" DESC LIMIT 10;

-- Check daily finalization status
SELECT * FROM "daily_finalization" 
ORDER BY date DESC LIMIT 10;

-- View monthly outcomes
SELECT mo.*, u.email, g.name
FROM "MonthlyOutcome" mo
JOIN "user" u ON mo."userId" = u.id
JOIN "Group" g ON mo."groupId" = g.id
ORDER BY mo."createdAt" DESC;

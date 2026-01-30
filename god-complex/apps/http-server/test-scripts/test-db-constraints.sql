-- Test 1: Unique constraint on user email
INSERT INTO "user" (id, email, name, "emailVerified") 
VALUES (gen_random_uuid(), 'duplicate@test.com', 'Test', false);
-- Run again - should fail with unique constraint violation

-- Test 2: Unique constraint on membership (userId, groupId, month)
INSERT INTO "Membership" (id, "userId", "groupId", month) 
VALUES (gen_random_uuid(), '<USER_ID>', '<GROUP_ID>', '2025-01');
-- Run again - should fail

-- Test 3: Foreign key constraint (Goal -> User)
INSERT INTO "Goal" (id, "userId", "groupId", date, title, category, "finishCondition", "minEffort", "isUncomfortable")
VALUES (gen_random_uuid(), 'non-existent-user-id', '<GROUP_ID>', CURRENT_DATE, 'Test', 'HEALTH', 'Finish', 'Min', false);
-- Should fail with foreign key violation

-- Test 4: Foreign key RESTRICT behavior (User deletion blocked by referencing rows)
-- Note: Schema uses RESTRICT (default) for Goal, GoalResult, Membership FKs.
-- Only Session and Account have CASCADE deletes.
-- To delete a user, first delete their goals, memberships, results, etc.
DELETE FROM "user" WHERE email = 'test-restrict@test.com';
-- Should FAIL if user has goals, memberships, or other referencing rows (RESTRICT behavior)
-- To properly test, ensure user has dependent records before attempting delete

-- Test 5: Check constraint on cutoffHour (0-23)
INSERT INTO "Group" (id, name, "monthlyPledge", "cutoffHour", timezone)
VALUES (gen_random_uuid(), 'Invalid Group', 100, 25, 'UTC');
-- Should fail if check constraint exists

-- Test 6: Unique constraint on Goal (userId, groupId, date, title)
INSERT INTO "Goal" (id, "userId", "groupId", date, title, category, "finishCondition", "minEffort", "isUncomfortable")
VALUES 
    (gen_random_uuid(), '<USER_ID>', '<GROUP_ID>', CURRENT_DATE, 'Duplicate Goal', 'HEALTH', 'Finish', 'Min', false),
    (gen_random_uuid(), '<USER_ID>', '<GROUP_ID>', CURRENT_DATE, 'Duplicate Goal', 'HEALTH', 'Finish', 'Min', false);
-- Second insert should fail

-- Test 7: Verify CASCADE works for Session/Account (auth-related)
-- These DO have onDelete: Cascade in schema
DELETE FROM "user" WHERE email = 'test-auth-cascade@test.com';
-- Should succeed and also delete related sessions and accounts (but fail if other refs exist)

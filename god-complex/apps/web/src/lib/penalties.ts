/**
 * Step 9: Penalty Type Definitions Display
 * 
 * Client-side copy of penalty definitions for UI display
 */

export const PENALTY_DEFINITIONS: Record<string, { title: string; dueInDays: number; icon: string }> = {
    WRITE_REFLECTION: {
        title: "Write a 1000-word reflection on failure",
        dueInDays: 3,
        icon: "📝"
    },
    MOCK_INTERVIEW: {
        title: "Complete a mock interview",
        dueInDays: 7,
        icon: "🎤"
    },
    GYM_SESSION: {
        title: "Complete 3 gym sessions",
        dueInDays: 5,
        icon: "💪"
    },
    PUBLIC_COMMITMENT_POST: {
        title: "Publish a public commitment post",
        dueInDays: 3,
        icon: "📢"
    }
};

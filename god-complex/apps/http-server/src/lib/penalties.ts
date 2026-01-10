export enum PenaltyType {
  WRITE_REFLECTION = "WRITE_REFLECTION",
  MOCK_INTERVIEW = "MOCK_INTERVIEW",
  GYM_SESSION = "GYM_SESSION",
  PUBLIC_COMMITMENT_POST = "PUBLIC_COMMITMENT_POST",
}

// TODO: add more / somehow allow the other members of the group to allocate a proper penalty
export const PENALTY_DEFINITIONS: Record<
  PenaltyType,
  { title: string; dueInDays: number }
> = {
  [PenaltyType.WRITE_REFLECTION]: {
    title: "Write a 1000-word reflection on failure",
    dueInDays: 3,
  },
  [PenaltyType.MOCK_INTERVIEW]: {
    title: "Complete a mock interview",
    dueInDays: 7,
  },
  [PenaltyType.GYM_SESSION]: {
    title: "Complete 3 gym sessions",
    dueInDays: 5,
  },
  [PenaltyType.PUBLIC_COMMITMENT_POST]: {
    title: "Publish a public commitment post",
    dueInDays: 3,
  },
};
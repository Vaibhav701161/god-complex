import { prisma } from "@god-complex/prisma";
import { getMonth } from "../lib/time";

export async function createGroup(userId: string, data: any) {
  return { id: "group-id", ...data };
}

export async function joinGroup(userId: string, groupId: string) {
  // Check for failed penalties before allowing user to join
  const failedCount = await prisma.penaltyAssignment.count({
    where: {
      userId,
      groupId,
      status: "FAILED",
    },
  });
  
  if (failedCount >= 1) {
    throw new Error("Clear failed penalties before joining");
  }


  return;
}

export async function getGroup(groupId: string) {
  return { id: groupId };
}

export async function lockGroup(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { memberships: true },
  });

  if (!group) {
    throw new Error("group not found");
  }

  const month = getMonth(new Date().toISOString());

  const existingMemberships = await prisma.membership.findMany({
    where: { groupId, month },
  });

  if (existingMemberships.length > 0) {
    throw new Error("Group already locked for this month");
  }

  const users = await prisma.user.findMany({
    where: {
      memberships: {
        some: { groupId },
      },
    },
  });

  if (users.length === 0) {
    throw new Error("no users in the group");
  }

  await prisma.membership.createMany({
    data: users.map((u) => ({
      userId: u.id,
      groupId,
      month,
    })),
  });
}
import { prisma } from "@god-complex/prisma";
import { getMonth } from "../lib/time";
const VALID_TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "America/Chicago",
    "America/Denver",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Pacific/Auckland",
];
interface CreateGroupInput {
    name: string;
    monthlyPledge: number;
    cutoffHour: number;
    timezone: string;
}
export async function createGroup(userId: string, data: CreateGroupInput) {
    const { name, monthlyPledge, cutoffHour, timezone } = data;
    if (!name || typeof name !== "string" || name.length < 3 || name.length > 100) {
        throw new Error("Name must be between 3 and 100 characters");
    }
    if (typeof monthlyPledge !== "number" || monthlyPledge < 0) {
        throw new Error("Monthly pledge must be a non-negative number");
    }
    if (typeof cutoffHour !== "number" || cutoffHour < 0 || cutoffHour > 23) {
        throw new Error("Cutoff hour must be between 0 and 23");
    }
    if (!timezone || !VALID_TIMEZONES.includes(timezone)) {
        throw new Error(`Invalid timezone. Valid options: ${VALID_TIMEZONES.join(", ")}`);
    }
    const month = getMonth(new Date().toISOString());
    const group = await prisma.$transaction(async (tx) => {
        const newGroup = await tx.group.create({
            data: {
                name,
                monthlyPledge,
                cutoffHour,
                timezone,
                creatorId: userId,
            },
        });
        await tx.membership.create({
            data: {
                userId,
                groupId: newGroup.id,
                month,
            },
        });
        return newGroup;
    });
    const groupWithMemberships = await prisma.group.findUnique({
        where: { id: group.id },
        include: {
            memberships: {
                where: { month },
                include: {
                    user: {
                        select: { id: true, name: true, displayName: true },
                    },
                },
            },
            creator: {
                select: { id: true, name: true, displayName: true },
            },
        },
    });
    return groupWithMemberships;
}
export async function joinGroup(userId: string, groupId: string) {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });
    if (!group) {
        throw new Error("Group not found");
    }
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
    const month = getMonth(new Date().toISOString());
    const existingMembership = await prisma.membership.findFirst({
        where: {
            userId,
            groupId,
            month,
        },
    });
    if (existingMembership) {
        throw new Error("Already a member of this group for the current month");
    }
    await prisma.$transaction(async (tx) => {
        await tx.groupJoinRequest.create({
            data: {
                userId,
                groupId,
                status: "APPROVED",
            },
        });
        await tx.membership.create({
            data: {
                userId,
                groupId,
                month,
            },
        });
    });
    return { success: true, message: "Successfully joined group" };
}
export async function getGroup(groupId: string) {
    const month = getMonth(new Date().toISOString());
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            memberships: {
                where: { month },
                include: {
                    user: {
                        select: { id: true, name: true, displayName: true },
                    },
                },
            },
            creator: {
                select: { id: true, name: true, displayName: true },
            },
        },
    });
    if (!group) {
        throw new Error("Group not found");
    }
    return {
        ...group,
        memberCount: group.memberships.length,
    };
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

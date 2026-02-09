import { prisma } from "@god-complex/prisma";
export async function assertMembership(userId: string, groupId: string, month: string) {
    const membership = await prisma.membership.findUnique({
        where: {
            userId_groupId_month: {
                userId,
                groupId,
                month,
            },
        },
    });
    if (!membership) {
        throw new Error("user is not an active member of this group");
    }
}

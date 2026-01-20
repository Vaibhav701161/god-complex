import { prisma } from "@god-complex/prisma";

export async function getMe(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            image: true,
            publicId: true,
            applicationDone: true,
            displayName: true,
            motivation: true,
            createdAt: true,
            memberships: {
                where: {
                    month: currentMonth,
                },
                select: {
                    groupId: true,
                    month: true,
                    group: {
                        select: {
                            id: true,
                            name: true,
                            timezone: true,
                            cutoffHour: true,
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}
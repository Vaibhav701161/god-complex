import { prisma } from "@god-complex/prisma";

export async function getMe(userId: string) {
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
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}
import { randomUUID } from "crypto";
import { prisma } from "@god-complex/prisma";
import { sendVerificationEmail } from "../auth/email-provider";
export async function getMe(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
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
export async function completeApplication(userId: string, data: {
    displayName: string;
    motivation: string;
}) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            displayName: data.displayName,
            motivation: data.motivation,
            applicationDone: true,
        },
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
    return user;
}
export async function getEmailVerificationStatus(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            email: true,
            emailVerified: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const recentVerification = await prisma.verification.findFirst({
        where: {
            identifier: user.email,
            createdAt: {
                gte: new Date(Date.now() - 60 * 1000),
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return {
        verified: user.emailVerified,
        email: user.email,
        canResend: !recentVerification,
        lastSentAt: recentVerification?.createdAt,
    };
}
export async function resendVerificationEmail(userId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            email: true,
            name: true,
            emailVerified: true,
        },
    });
    if (!user) {
        return { success: false, error: "User not found" };
    }
    if (user.emailVerified) {
        return { success: false, error: "Email already verified" };
    }
    const recentVerification = await prisma.verification.findFirst({
        where: {
            identifier: user.email,
            createdAt: {
                gte: new Date(Date.now() - 60 * 1000),
            },
        },
    });
    if (recentVerification) {
        return { success: false, error: "Please wait before requesting another email" };
    }
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verification.create({
        data: {
            identifier: user.email,
            value: token,
            expiresAt,
        },
    });
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:4000";
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    const result = await sendVerificationEmail(user.email, verificationUrl, user.name);
    if (!result.success) {
        return { success: false, error: "Failed to send email" };
    }
    return { success: true };
}
export async function getUserById(userId: string) {
    return prisma.user.findUnique({
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
}
export async function updateUser(userId: string, data: Partial<{
    displayName: string;
    motivation: string;
    image: string;
}>) {
    return prisma.user.update({
        where: { id: userId },
        data,
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
}

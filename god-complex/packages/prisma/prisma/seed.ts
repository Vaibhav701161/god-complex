import { prisma } from "../src";
import { randomUUID } from "crypto";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
const scryptAsync = promisify(scrypt);
async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
}
async function main() {
    console.log(" Seeding database...");
    console.log("  Cleaning existing data...");
    await prisma.goalResult.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.groupJoinRequest.deleteMany();
    await prisma.monthlyOutcome.deleteMany();
    await prisma.penaltyAssignment.deleteMany();
    await prisma.dailyFinalization.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
    console.log("  Creating test users...");
    const user1 = await prisma.user.create({
        data: {
            id: randomUUID(),
            email: "verified@test.com",
            name: "Verified User",
            emailVerified: true,
            applicationDone: true,
            displayName: "VerifiedOne",
            motivation: "Testing the system with a verified account",
            publicId: "GC-TEST-01",
        },
    });
    console.log(`    Created: ${user1.email} (verified, application done)`);
    const user2 = await prisma.user.create({
        data: {
            id: randomUUID(),
            email: "noapp@test.com",
            name: "No Application User",
            emailVerified: true,
            applicationDone: false,
            publicId: "GC-TEST-02",
        },
    });
    console.log(`    Created: ${user2.email} (verified, no application)`);
    const user3 = await prisma.user.create({
        data: {
            id: randomUUID(),
            email: "unverified@test.com",
            name: "Unverified User",
            emailVerified: false,
            applicationDone: false,
            publicId: "GC-TEST-03",
        },
    });
    console.log(`    Created: ${user3.email} (unverified)`);
    const adminUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            email: "admin@test.com",
            name: "Admin User",
            emailVerified: true,
            applicationDone: true,
            displayName: "SystemAdmin",
            motivation: "Administering and testing the God Complex system",
            publicId: "GC-ADMIN-01",
        },
    });
    console.log(`    Created: ${adminUser.email} (admin)`);
    console.log("  Creating account records with passwords...");
    const hashedPassword = await hashPassword("password123");
    await prisma.account.createMany({
        data: [
            {
                id: randomUUID(),
                userId: user1.id,
                accountId: user1.id,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: user2.id,
                accountId: user2.id,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: user3.id,
                accountId: user3.id,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: adminUser.id,
                accountId: adminUser.id,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
    });
    console.log("    Created credential accounts with password: password123");
    console.log("  Creating test groups...");
    const group1 = await prisma.group.create({
        data: {
            id: randomUUID(),
            name: "Alpha Testers",
            monthlyPledge: 100,
            cutoffHour: 22,
            timezone: "America/New_York",
            creatorId: user1.id,
        },
    });
    console.log(`    Created group: ${group1.name}`);
    const group2 = await prisma.group.create({
        data: {
            id: randomUUID(),
            name: "Beta Squad",
            monthlyPledge: 50,
            cutoffHour: 23,
            timezone: "Europe/London",
            creatorId: adminUser.id,
        },
    });
    console.log(`    Created group: ${group2.name}`);
    console.log("  Creating memberships...");
    const currentMonth = new Date().toISOString().slice(0, 7);
    await prisma.membership.create({
        data: {
            userId: user1.id,
            groupId: group1.id,
            month: currentMonth,
        },
    });
    await prisma.membership.create({
        data: {
            userId: adminUser.id,
            groupId: group1.id,
            month: currentMonth,
        },
    });
    await prisma.membership.create({
        data: {
            userId: adminUser.id,
            groupId: group2.id,
            month: currentMonth,
        },
    });
    console.log(`    Created memberships for month: ${currentMonth}`);
    console.log("  Creating sample goals...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.goal.create({
        data: {
            userId: user1.id,
            groupId: group1.id,
            date: today,
            title: "Complete daily coding challenge",
            category: "BUILD",
            finishCondition: "Submit solution on LeetCode",
            minEffort: "Attempt the problem for 30 minutes",
            isUncomfortable: false,
            isLocked: false,
        },
    });
    await prisma.goal.create({
        data: {
            userId: user1.id,
            groupId: group1.id,
            date: today,
            title: "Morning workout",
            category: "HEALTH",
            finishCondition: "Complete 30-minute workout",
            minEffort: "Do 10 pushups and 10 squats",
            isUncomfortable: true,
            isLocked: false,
        },
    });
    console.log("    Created sample goals for today");
    console.log("  Creating join requests...");
    await prisma.groupJoinRequest.create({
        data: {
            groupId: group1.id,
            userId: user2.id,
            status: "PENDING",
        },
    });
    console.log("    Created pending join request");
    console.log("\n Seeding complete!");
    console.log("\n Test accounts (password: password123):");
    console.log("   - verified@test.com (fully setup)");
    console.log("   - noapp@test.com (needs application)");
    console.log("   - unverified@test.com (needs email verification)");
    console.log("   - admin@test.com (admin user)");
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(" Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
});

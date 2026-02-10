if (process.env.NODE_ENV !== "production") {
    require("dotenv/config");
}
export * from "../generated/prisma/client";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("[PRISMA] DATABASE_URL is not set!");
    throw new Error("DATABASE_URL environment variable is required");
}
console.log("[PRISMA] Initializing Prisma client with PG adapter");
const pool = new pg.Pool({
    connectionString,
});
const adapter = new PrismaPg(pool);
const prismaInstance = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
export const prisma = prismaInstance;
export { pool, adapter };

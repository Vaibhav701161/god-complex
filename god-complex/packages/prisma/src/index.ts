import "dotenv/config";
export * from "../generated/prisma/client";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("[PRISMA] DATABASE_URL is not set!");
}

const pool = new pg.Pool({
  connectionString,
  max: 10, // Limit pool size for Neon/Dev
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
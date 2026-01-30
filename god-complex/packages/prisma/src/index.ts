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
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

const adapter = new PrismaPg(pool);

// Create and export a properly configured Prisma client instance
export const prisma = new PrismaClient({ adapter });

// Also export the pool and adapter for advanced use cases
export { pool, adapter };

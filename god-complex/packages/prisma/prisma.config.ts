/// <reference types="node" />
if (process.env.NODE_ENV !== "production") {
    require("dotenv/config");
}
import { defineConfig } from "prisma/config";
export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        // Fallback to dummy URL for build time (e.g. valid during Docker build without env vars)
        url: process.env["DATABASE_URL"] ?? "postgresql://dummy:dummy@localhost:5432/dummy",
    },
});

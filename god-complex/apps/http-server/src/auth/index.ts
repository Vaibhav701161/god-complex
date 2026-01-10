import { betterAuth } from "better-auth";
import { prisma } from "@god-complex/prisma"; // Assuming this is your adapter path

export const auth = betterAuth({
  database: prisma,
  emailAndPassword: { enabled: true },
  session: {
    
    expiresIn: 60 * 60 * 24 * 7,
    freshAge: 60 * 60 * 24,    
  },
});
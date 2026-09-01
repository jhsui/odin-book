import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.ts";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.FRONTEND_URL!],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

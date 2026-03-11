import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import type { User } from "$gen/prisma/client/client";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
// If your Prisma file is located elsewhere, you can change the path

console.log(env.BETTER_AUTH_BASE_URL)

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: dev ? 'http://localhost:3000' : env.BETTER_AUTH_BASE_URL,
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: false,
        revokeSessionsOnPasswordReset: true,
    },
    database: prismaAdapter(prisma, {
        provider: "mysql",
    }),
});

export interface BetterAuthSession {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: User;
}
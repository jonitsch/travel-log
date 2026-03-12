import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import type { User } from "$gen/prisma/client/client";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
// If your Prisma file is located elsewhere, you can change the path



export const auth = betterAuth({
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
    plugins: [sveltekitCookies(getRequestEvent)],
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
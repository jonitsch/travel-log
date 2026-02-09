import { env } from "$env/dynamic/private";
import { PrismaClient } from "$gen/prisma/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL) });

export { prisma };

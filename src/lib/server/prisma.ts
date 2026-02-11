import { env } from "$env/dynamic/private";
import { PrismaClient } from "$gen/prisma/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({
    adapter: new PrismaMariaDb({
        host: env.DATABASE_HOST,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    })
});

export { prisma };

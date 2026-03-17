import { prisma } from '$lib/server/prisma.js';
import { type ServerInit } from '@sveltejs/kit';
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

export async function handle({ event, resolve }) {
    // Fetch current session from Better Auth
    const session = await auth.api.getSession({
        headers: event.request.headers,
    });
    // Make session and user available on server
    if (session) {
        event.locals.session = session;
        event.locals.user = session.user;
    }
    return svelteKitHandler({ event, resolve, auth, building });
}

export const init: ServerInit = async () => {
    try {
        await prisma.$connect();

        console.log(`Testing database connection...`);
        const test = await prisma.$queryRaw`SELECT 1`;
        if (!test) throw Error('Database connection test failed!');

        console.log('Database connection successful!');
    } catch (err) {
        console.error('Database connection failed!', err);
    }
}

import fs from 'fs';
import path from "path";
import { prisma } from '$lib/server/prisma.js';
import { type ServerInit } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { getImageData, type imgCreateBody } from './lib/utils/server';

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
        console.log('Database connection successful!');
    } catch (err) {
        console.error('Database connection failed!', err);
    }

    await initializeDatabase();
}

async function initializeDatabase() {
    console.log('Database Initialization started');
    let images = await prisma.image.findMany();
    if (images) {
        await prisma.image.deleteMany();
        try {
            await prisma.image.deleteMany();
            let journeys = await prisma.journey.findMany();
            for (const j of journeys) {
                const journeyImages = await getImages(j.journeyId);
                for (const imgData of journeyImages) {
                    if (!imgData) throw Error(`No Image Data for: ${imgData}`);
                    await prisma.image.create({
                        data: imgData,
                    });
                }
            }
        }
        catch (err) {
            images = [];
            console.log('Database Initialization failed', err)
            console.error(err)
        }
    }
    images = [];
    console.log('Database Initialization finished!');
}

async function getImages(journeyId: string) {
    console.log('GetImages started: Getting Images for: ', journeyId);
    let images: imgCreateBody[] = [];
    try {
        let dir = env.IMAGE_FOLDER_PATH + journeyId;
        if (!fs.existsSync(dir)) {
            return images;
        };
        let entries = await fs.promises.readdir(dir, {
            withFileTypes: true,
            recursive: true,
        });
        for (const entry of entries) {
            let filePath = path.join(entry.parentPath, entry.name);
            if (!filePath) throw Error(`File path is not defined for ${entry}`);
            if (entry.isFile()) {
                const imgData = await getImageData(entry.name, filePath, journeyId);
                if (!imgData) continue;
                images.push(imgData);
            }
            else { console.log('Skipped entry as it is not a file: ', filePath) }
        };
    } catch (err) {
        console.log('GetImages failed', err)
        console.error(err);
    } finally {
        return images;
    }
}

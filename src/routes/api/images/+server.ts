import type { Image } from '$gen/prisma/client/client';
import { prisma } from '$lib/server/prisma';
import { json, redirect, error } from '@sveltejs/kit';

export async function GET({ url, locals }) {
    const user = locals.user;
    if (!user) {
        throw redirect(302, '/auth/login');
    }

    const journeyId = url.searchParams.get('journeyId');
    if (!journeyId) {
        throw error(400, 'Missing journeyId');
    }

    const journey = await prisma.journey.findUnique({
        where: {
            journeyId,
            userId: user.id
        },
        include: {
            image: true
        }
    });
    if (!journey) {
        throw error(404, 'Journey not found');
    }

    return json(journey.image as Image[]);
}
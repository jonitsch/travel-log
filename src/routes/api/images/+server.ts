import type { Image } from '$gen/prisma/client/client';
import { prisma } from '$src/lib/server/prisma';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
    let journeyIdString = journeyId.url.search.split('=')[1]
    let images: Image[] = await prisma.image.findMany({
        where: {
            journeyId: journeyIdString
        }
    });
    return json(images);
}

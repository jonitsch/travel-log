import { prisma } from '$src/lib/server/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
    let journeyIdString = journeyId.url.search.split('=')[1]
    let images: {
        path: string;
        fileName: string;
        width: number;
        height: number;
        lng: number | null;
        lat: number | null;
        journeyId: string;
    }[] = await prisma.image.findMany({
        where: {
            journeyId: journeyIdString
        }
    });
    return json(images);
}

import type { PageServerLoad, Actions } from './$types';
import { prisma, type Journey } from '$src/lib/server/prisma';

export const load = (async () => {
    const journeys: Journey[] = await prisma.journey.findMany({
        select: {
            journeyId: true,
            name: true,
            color: true,
            lng: true,
            lat: true,
            marker: true,
            image: true,
        }
    })
    return { journeys };
}) satisfies PageServerLoad;

export const actions = {
    addJourney: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name')?.toString() ?? '';
        const lng = parseFloat(data.get('lng')?.toString() ?? '0');
        const lat = parseFloat(data.get('lat')?.toString() ?? '0');

        try {
            const journey = await prisma.journey.create({
                data: {
                    name: name,
                }
            })
            return { success: true }
        } catch (err) {
            return err
        }
    },
    getMarkers: async ({ request }) => {
        const data = await request.formData();
        const journeyId = data.get('journeyId')?.toString()
        try {
            let markers = await prisma.marker.findMany(
                {
                    include: {
                        journey: {
                            select: {
                                color: true
                            }
                        }
                    },
                    where: {
                        journeyId: journeyId
                    }
                }
            )
            return markers;
        } catch (err) {
            return err
        }
    }
} satisfies Actions;
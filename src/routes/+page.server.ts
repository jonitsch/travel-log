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
        try {
            const data = await request.formData();
            const name: string = `${data.get('name')}`;
            const lng: number = parseFloat(`${data.get('lng')}`);
            const lat: number = parseFloat(`${data.get('lat')}`);
            const color: string = `${data.get('color')}`;
            const journeyId: string = `${name.toLowerCase().slice(0, 4)}-${crypto.randomUUID()}`;

            const res = await prisma.journey.create({
                data: {
                    name: name,
                    lng: lng,
                    lat: lat,
                    color: color,
                    journeyId: journeyId,
                }
            });
            const journey = {
                journeyId: res.journeyId,
                name: res.name,
                color: res.color
            }
            return { success: true, journey };
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    deleteJourney: async ({ request }) => {
        try {
            const data = await request.formData();
            const journeyId: string = `${data.get('journeyId')}`;
            const res = await prisma.journey.delete({
                where: {
                    journeyId: journeyId
                }
            });
            const deletedId = res.journeyId
            return { success: true, deletedId };
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
} satisfies Actions;
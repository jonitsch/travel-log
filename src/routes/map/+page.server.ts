import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$src/lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { redirect } from "@sveltejs/kit";
import type { Journey } from '$gen/prisma/client/client';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) throw redirect(303, '/auth/login');
    const journeys: Journey[] = await prisma.journey.findMany({
        include: {
            marker: true,
            image: true,
        },
        where: {
            userId: user.id,
        }
    })
    return {
        journeys: journeys,
        user: user,
    };
}

export const actions = {
    addJourney: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user) throw redirect(303, '/auth/login');

            const data = await request.formData();
            const name: string = `${data.get('name')}`;
            const lng: number = parseFloat(`${data.get('lng')}`);
            const lat: number = parseFloat(`${data.get('lat')}`);
            const color: string = `${data.get('color')}`;
            const journeyId: string = `${name.toLowerCase().slice(0, 4)}-${crypto.randomUUID()}`;
            const userId: string = user.id;
            console.log(`Attempting to create new Journey \`${journeyId}\`...`);

            const res = await prisma.journey.create({
                data: {
                    name: name,
                    lng: lng,
                    lat: lat,
                    color: color,
                    journeyId: journeyId,
                    userId: userId,
                }
            });
            const journey = {
                journeyId: res.journeyId,
                name: res.name,
                color: res.color
            }
            await fs.mkdir(`${env.IMAGE_FOLDER_PATH}/${journeyId}`);
            console.log(`Successfully created Image Folder: \`${env.IMAGE_FOLDER_PATH}/${journeyId}\``);
            console.log(`Journey \`${journey.journeyId}\` was successfully created!`);
            return { success: true, journey };
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
    deleteJourney: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user) throw redirect(303, '/auth/login');
            
            const data = await request.formData();
            const journeyId: string = `${data.get('journeyId')}`;
            const imageFolder: string = `${env.IMAGE_FOLDER_PATH}/${journeyId}`;
            console.log(`Attempting to delete Journey \`${journeyId}\`...`);
            const res = await prisma.journey.delete({
                where: {
                    journeyId: journeyId
                }
            });
            await fs.rm(imageFolder, { recursive: true });
            console.log(`Journey \`${journeyId}\` was successfully deleted!`)
            return {
                success: true, deletedJourney: {
                    journeyId: res.journeyId,
                    name: res.name,
                }
            };
        } catch (err) {
            console.error(err);
            throw err;
        }
    },
} satisfies Actions;
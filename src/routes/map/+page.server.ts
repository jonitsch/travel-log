import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { redirect } from "@sveltejs/kit";
import type { Journey } from '$gen/prisma/client/client';
import { dev } from '$app/environment';
import { existsSync, writeFileSync } from 'fs';
import { getImageData, type imgCreateBody } from '$lib/utils/server';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        throw redirect(303, '/auth/login');}
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
            await fs.mkdir(env.IMAGE_FOLDER_PATH + journeyId);
            console.log(`Successfully created Image Folder: \`${env.IMAGE_FOLDER_PATH + journeyId}\``);
            console.log(`Journey \`${journey.journeyId}\` was successfully created!`);
            return { success: true, journey };
        } catch (err) {
            throw err;
        }
    },
    deleteJourney: async ({ request, locals }) => {
        try {
            const user = locals.user;
            if (!user) throw redirect(303, '/auth/login');
            
            const data = await request.formData();
            const journeyId: string = `${data.get('journeyId')}`;
            const imageFolder: string = env.IMAGE_FOLDER_PATH + journeyId;
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
            throw err;
        }
    },
    addImage: async ({ request }) => {
        try {
            const data = await request.formData();
            const journeyId = `${data.get('journeyId')}`;
            const files = data.getAll('files') as Array<File>;

            let path = env.IMAGE_FOLDER_PATH + journeyId + '/';
            console.log(`Attempting to add Images at ${path}`)
            if(!existsSync(path)) throw Error('404: Image Directory not found!');

            for (const file of files) {
                const id = crypto.randomUUID();
                writeFileSync(path + id, Buffer.from(await file.arrayBuffer()));
                let imgData = await getImageData(file.name, path + id, journeyId);
                await prisma.image.create({data: {
                    id: id,
                    ...imgData,
                }});
            }
            console.log('Images added successfully!', files);
        } catch(err) {
            throw err;
        }
    }
} satisfies Actions;
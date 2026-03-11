import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { redirect } from "@sveltejs/kit";
import type { Journey } from '$gen/prisma/client/client';
import { existsSync, writeFileSync } from 'fs';
import { getImageData, type imgCreateBody } from '$lib/utils/server';
import z from 'zod';
import { fail, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

const addImageSchema = z.object({
    journeyId: z.string(),
    files: z.array(z.file().mime('image/*')),
});

const deleteImageSchema = z.object({
    journeyId: z.string(),
    imgIds: z.array(z.string()),
})

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        throw redirect(303, '/auth/login');
    }
    const journeys: Journey[] = await prisma.journey.findMany({
        include: {
            marker: true,
            image: true,
        },
        where: {
            userId: user.id,
        }
    })
    const addImageForm = await superValidate(zod4(addImageSchema));
    const deleteImageForm = await superValidate(zod4(deleteImageSchema));
    return {
        journeys: journeys,
        user: user,
        addImageForm: addImageForm,
        deleteImageForm: deleteImageForm
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
            const form = await superValidate(request, zod4(addImageSchema));
            const { journeyId, files } = form.data;

            let path = env.IMAGE_FOLDER_PATH + journeyId + '/';
            console.log(`Attempting to add Images at ${path}`)
            if (!existsSync(path)) {
                fs.mkdir(path);
                console.warn(`Image Folder did not exist at addImage action call and has now been created!`);
            }

            for (const file of files) {
                if (!file.type.includes('image/')) {
                    const err = `${file.name} is of type ${file.type} instead of the expected type image/*`
                    console.error(err);
                    return fail(400, { form });
                }

                const id = crypto.randomUUID();
                const imgPath = path + id;
                writeFileSync(imgPath, Buffer.from(await file.arrayBuffer()));
                
                let imgData: imgCreateBody = await getImageData(file.name, imgPath, journeyId);
                if (!imgData) return fail(500, { message: 'Image Upload failed' });

                await prisma.image.create({
                    data: {
                        id: id,
                        ...imgData,
                    }
                });
            }
            console.log('Images added successfully!', files.map((f) => f.name));
            return withFiles({ form, journeyId });
        } catch (err) {
            throw err;
        }
    },
    deleteImage: async ({ request }) => {
        try {
            const form = await superValidate(request, zod4(deleteImageSchema));
            const { journeyId, imgIds } = form.data;

            console.log(imgIds)

            if (!form.valid) return fail(400, { form });

            let deletedImgs: string[] = []
            for (const id of imgIds) {
                const img = await prisma.image.delete({
                    where: {
                        id: id,
                        journeyId: journeyId,
                    }
                })
                await fs.rm(img.path);
                deletedImgs.push(img.fileName);
            }

            return { form, journeyId, deletedImgs };
        } catch (err) {
            throw err;
        }
    }
} satisfies Actions;
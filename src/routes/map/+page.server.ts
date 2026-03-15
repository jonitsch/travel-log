import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { redirect } from '@sveltejs/kit';
import type { Image, Journey } from '$gen/prisma/client/client';
import { existsSync, writeFileSync } from 'fs';
import { getImageData, type imgCreateBody } from '$lib/utils/server';
import z from 'zod';
import { fail, message, setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

const addImageSchema = z.object({
    journeyId: z.string(),
    files: z.array(z.file())
});
const deleteImageSchema = z.object({
    journeyId: z.string(),
    imgIds: z.array(z.string())
});
const renameImageSchema = z.object({
    imgId: z.string(),
    newName: z.string()
});

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        throw redirect(303, '/auth/login');
    }
    const journeys: Journey[] = await prisma.journey.findMany({
        include: {
            marker: true,
            image: true
        },
        where: {
            userId: user.id
        }
    });
    const addImageForm = await superValidate(zod4(addImageSchema));
    const deleteImageForm = await superValidate(zod4(deleteImageSchema));
    const renameImageForm = await superValidate(zod4(renameImageSchema));
    return {
        journeys: journeys,
        user: user,
        addImageForm: addImageForm,
        deleteImageForm: deleteImageForm,
        renameImageForm: renameImageForm
    };
};

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
                    userId: userId
                }
            });
            const journey = {
                journeyId: res.journeyId,
                name: res.name,
                color: res.color
            };
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
                    journeyId: journeyId,
                    userId: user.id
                }
            });
            await fs.rm(imageFolder, { recursive: true });
            console.log(`Journey \`${journeyId}\` was successfully deleted!`);

            return {
                success: true,
                deletedJourney: {
                    journeyId: res.journeyId,
                    name: res.name
                }
            };
        } catch (err) {
            throw err;
        }
    },
    addImage: async ({ request }) => {
        const form = await superValidate(request, zod4(addImageSchema));
        console.log(form);
        if (!form.valid) return fail(400, { form });
        
        try {
            const { journeyId, files } = form.data;

            let path = env.IMAGE_FOLDER_PATH + journeyId + '/';
            console.log(`Attempting to add Images at ${path}`);

            if (!existsSync(path)) {
                fs.mkdir(path);
                console.warn(
                    `Image Folder did not exist at addImage action call and has now been created!`
                );
            }

            for (const file of files) {
                if (!file.type.includes('image/') && file.type != 'application/octet-stream') {
                    const err = `${file.name} is of type ${file.type} instead of the expected types image/*, application/octet-stream`;
                    console.error(err);
                    return setError(form, 'files._errors', err);
                }

                const id = crypto.randomUUID();
                const imgPath = path + id;
                writeFileSync(imgPath, Buffer.from(await file.arrayBuffer()));

                let imgData: imgCreateBody = await getImageData(file.name, imgPath, journeyId);
                if (!imgData) return fail(500, { message: 'Image Upload failed' });

                await prisma.image.create({
                    data: {
                        id: id,
                        ...imgData
                    }
                });
            }
            console.log(
                'Images added successfully:',
                files.map((f) => f.name)
            );
            return withFiles({ form, journeyId });
        } catch (err) {
            return message(form, err instanceof Error ? err.message : 'Unknown error', { status: 500 });
        }
    },
    deleteImage: async ({ request }) => {
        const form = await superValidate(request, zod4(deleteImageSchema));
        if (!form.valid) return fail(400, { form });
        try {
            const { journeyId, imgIds } = form.data;
            console.log(`Attempting to delete Images:`, imgIds);

            let deletedImgs: Image[] = [];
            for (const id of imgIds) {
                const img = await prisma.image.delete({
                    where: {
                        id: id,
                        journeyId: journeyId
                    }
                });
                await fs.rm(img.path);
                deletedImgs.push(img);
            }

            console.log(
                `Successfully deleted Images:`,
                deletedImgs.map((i) => i.id)
            );
            return { form, deletedImgs, journeyId };
        } catch (err) {
            return message(form, err instanceof Error ? err.message : 'Unknown error', { status: 500 });
        }
    },
    renameImage: async ({ request }) => {
        const form = await superValidate(request, zod4(renameImageSchema));
        if (!form.valid) return fail(400, { form });
        try {
            const { imgId, newName } = form.data;
            console.log(`Attempting to rename Image: ${imgId}`);

            const renamedImg = await prisma.image.update({
                where: {
                    id: imgId
                },
                data: {
                    fileName: newName
                }
            });

            const journeyId = renamedImg.journeyId;

            console.log(`Successfully renamed Image to: ${newName}`);
            return { form, newName, journeyId };
        } catch (err) {
            return message(form, err instanceof Error ? err.message : 'Unknown error', { status: 500 });
        }
    }
} satisfies Actions;

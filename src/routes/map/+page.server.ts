import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { error, redirect } from '@sveltejs/kit';
import type { Image, Journey } from '$gen/prisma/client/client';
import { getImagePath } from '$lib/utils/server';
import z from 'zod';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { s3 } from '$lib/server/aws';
import { dev } from '$app/environment';

const prod = !dev;

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
			const name = `${data.get('name')}`;
			const lng = parseFloat(`${data.get('lng')}`);
			const lat = parseFloat(`${data.get('lat')}`);
			const color = `${data.get('color')}`;
			const journeyId = `${name.toLowerCase().slice(0, 4)}-${crypto.randomUUID()}`;
			const userId = user.id;
			
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
			if (dev) {
				await fs.mkdir(env.IMAGE_FOLDER_PATH + journeyId);
				console.log(`Successfully created Image Folder: \`${env.IMAGE_FOLDER_PATH + journeyId}\``);
			}
			console.log(`Journey \`${journey.journeyId}\` was successfully created!`);

			return { success: true, journey };
		} catch (err) {
			return error(500, `Something went wrong! ${err}`);
		}
	},
	deleteJourney: async ({ request, locals }) => {
		try {
			const user = locals.user;
			if (!user) throw redirect(303, '/auth/login');

			const data = await request.formData();
			const journeyId = `${data.get('journeyId')}`;
			console.log(`Attempting to delete Journey \`${journeyId}\`...`);
			const res = await prisma.journey.delete({
				where: {
					journeyId: journeyId,
					userId: user.id
				}
			});
			if (dev) {
				const imageFolder = env.IMAGE_FOLDER_PATH + journeyId;
				await fs.rm(imageFolder, { recursive: true });
			} else {
				await s3.deletePrefix({ prefix: `${journeyId}/` });
			}
			console.log(`Journey \`${journeyId}\` was successfully deleted!`);

			return {
				success: true,
				deletedJourney: {
					journeyId: res.journeyId,
					name: res.name
				}
			};
		} catch (err) {
			return error(500, `Something went wrong! ${err}`);
		}
	},
	deleteImage: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(deleteImageSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const user = locals.user;
			if (!user) {
				throw redirect(303, '/auth/login');
			}

			const { journeyId, imgIds } = form.data;
			console.log(`Attempting to delete Images:`, imgIds);

			let deletedImgs: Image[] = [];
			for (const id of imgIds) {
				const img = await prisma.image.findUnique({
					where: {
						id: id,
						userId: user.id,
						journeyId: journeyId
					}
				});
				if (!img) return message(form, 'Image could not be found in Database!', { status: 404 });

				await prisma.image.delete({ where: { id, userId: user.id } });

				if (prod) {
					await s3.delete({
						key: `${img.journeyId}/${img.id}`
					});
				} else {
					const imgPath = getImagePath(img.id, img.journeyId);
					await fs.rm(imgPath);
				}

				deletedImgs.push(img);
			}

			console.log(
				`Successfully deleted Images:`,
				deletedImgs.map((i) => i.id)
			);
			return { form, deletedImgs, journeyId };
		} catch (err) {
			console.log('Failed to delete Images:', form.data.imgIds);
			console.error(err);

			return message(form, 'Something went wrong!', { status: 500 });
		}
	},
	renameImage: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(renameImageSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const user = locals.user;
			if (!user) {
				throw redirect(303, '/auth/login');
			}

			const { imgId, newName } = form.data;
			console.log(`Attempting to rename Image: ${imgId}`);

			const img = await prisma.image.findUnique({
				where: { id: imgId, userId: user.id },
				select: { id: true }
			});

			if (!img) return message(form, 'Image could not be found in Database!', { status: 404 });

			await prisma.image.update({
				where: { id: img.id },
				data: { fileName: newName }
			});

			console.log(`Successfully renamed Image to: ${newName}`);
			return { form, newName };
		} catch (err) {
			console.error(err);
			return message(form, 'Something went wrong!', { status: 500 });
		}
	}
} satisfies Actions;

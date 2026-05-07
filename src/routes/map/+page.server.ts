import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { redirect } from '@sveltejs/kit';
import type { Image, Journey } from '$gen/prisma/client/client';
import { existsSync, writeFileSync } from 'fs';
import { getImageData, getImagePath, type imgCreateBody } from '$lib/utils/server';
import z from 'zod';
import { fail, message, setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { s3 } from '$lib/server/aws';

const dev = env.NODE_ENV != 'production';
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
			throw err;
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
				await s3.delete({ key: journeyId });
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
			throw err;
		}
	},
	addImage: async ({ request }) => {
		const form = await superValidate(request, zod4(addImageSchema));
		if (!form.valid) return fail(400, { form });

		try {
			const { journeyId, files } = form.data;

			const uploadFolder = dev ? `${env.IMAGE_FOLDER_PATH}${journeyId}/` : 'tmp/';

			console.log(`Attempting to add Images at ${uploadFolder}`);

			if (!existsSync(uploadFolder)) {
				fs.mkdir(uploadFolder);
				console.warn(
					`Upload Folder: \`${uploadFolder}\` did not exist at addImage action call and has now been created!`
				);
			}

			for (const file of files) {
				if (!file.type.includes('image/') && file.type != 'application/octet-stream') {
					const err = `${file.name} is of type ${file.type} instead of the expected types image/*, application/octet-stream`;
					console.error(err);
					return setError(form, 'files._errors', err);
				}

				const id = crypto.randomUUID();
				const imgKey = journeyId + '/' + id;
				const imgPath = getImagePath(id, journeyId);

				writeFileSync(imgPath, Buffer.from(await file.arrayBuffer()));

				let imgData: imgCreateBody = await getImageData(file.name, imgPath, journeyId);
				if (!imgData) return fail(500, { message: 'Image Upload failed' });

				await prisma.image.create({
					data: {
						id: id,
						...imgData
					}
				});

				if (prod) {
					await s3.upload({
						key: imgKey,
						body: Buffer.from(await file.arrayBuffer())
					});

					await fs.rm(imgPath); // remove temporary img file
				}
			}
			console.log(
				'Images added successfully:',
				files.map((f) => f.name)
			);
			return withFiles({ form, journeyId });
		} catch (err) {
			console.error(`Failed to add Images! ${err}`);
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

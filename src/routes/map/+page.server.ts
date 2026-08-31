import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { error, redirect } from '@sveltejs/kit';
import type { Journey } from '$gen/prisma/client/client';
import { useS3 } from '$lib/utils/server';
import z from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { s3 } from '$lib/server/aws';

const addImageSchema = z.object({
	journeyId: z.string(),
	files: z.array(z.file())
});
const deleteImageSchema = z.object({
	journeyId: z.string(),
	imgIds: z.array(z.string())
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
	return {
		journeys: journeys,
		user: user,
		addImageForm: addImageForm,
		deleteImageForm: deleteImageForm
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

			if (!useS3) {
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

			if (!useS3) {
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
	}
} satisfies Actions;

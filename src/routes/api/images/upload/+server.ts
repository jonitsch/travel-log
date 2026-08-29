import { prisma } from '$lib/server/prisma';
import { s3 } from '$lib/server/aws';
import { getImageData, getImagePath, useS3 } from '$lib/utils/server';
import { json } from '@sveltejs/kit';
import crypto, { randomInt } from 'crypto';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';
import { global } from '$lib/state.svelte';

export const POST = async ({ request, locals }) => {
	const form = await request.formData();

	const file = form.get('file') as File;
	const journeyId = form.get('journeyId') as string;

	let id = '';
	let key = '';

	try {
		const user = locals.user;
		if (!user) return new Response('Unauthorized', { status: 401 });

		if (!file || !journeyId) return new Response('Missing data', { status: 400 });

		const journey = await prisma.journey.findFirst({ where: { journeyId } });
		if (!journey) return new Response('Journey not found!', { status: 404 });

		if (user.id != journey?.userId) return new Response('Unauthorized', { status: 401 });

		const buffer = Buffer.from(await file.arrayBuffer());

		id = crypto.randomUUID();
		key = `${journeyId}/${id}`;

		const imgData = await getImageData(file.name, buffer, journeyId);

		if (useS3) {
			await s3.upload({
				key,
				body: buffer
			});
		} else {
			const imgPath = path.join(env.IMAGE_FOLDER_PATH, key);
			await fs.writeFile(imgPath, buffer);
		}

		await prisma.image.create({
			data: {
				id,
				userId: user.id,
				...imgData
			}
		});

		return json({ id, key });
	} catch (err) {
		console.error(`Failed to add Images: ${err}`);

		// Undo latest operation on Error
		if (useS3 && key) {
			await s3.delete({ key });
		} else {
			const imgPath = getImagePath(id, journeyId);
			await fs.rm(imgPath);
		}

		if (await prisma.image.findUnique({ where: { id } })) {
			await prisma.image.delete({ where: { id } });
		}

		console.error(`Failed to delete Image: ${err}`);
		return new Response(
			JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error!' }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
	} finally {
		global.loadingJourney = false;
	}
};

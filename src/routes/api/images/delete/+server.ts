import { prisma } from '$lib/server/prisma';
import { s3 } from '$lib/server/aws';
import { useS3 } from '$lib/utils/server';
import { json } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';
import { global } from '$lib/state.svelte';

export const POST = async ({ request, locals }) => {
	const form = await request.formData();

	const id = form.get('id') as string;
	const journeyId = form.get('journeyId') as string;

	const key = `${journeyId}/${id}`;

	try {
		const user = locals.user;
		if (!user) return new Response('Unauthorized', { status: 401 });

		if (!id || !journeyId) return new Response('Missing data', { status: 400 });

		const journey = await prisma.journey.findFirst({ where: { journeyId } });
		if (!journey) return new Response('Journey not found!', { status: 404 });

		if (user.id != journey?.userId) return new Response('Unauthorized', { status: 401 });

		if (useS3) {
			await s3.delete({ key });
		} else {
			const imgPath = path.join(env.IMAGE_FOLDER_PATH, key);
			await fs.rm(imgPath);
		}

		await prisma.image.delete({ where: { id } });

		return json({ id, key });
	} catch (err) {
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

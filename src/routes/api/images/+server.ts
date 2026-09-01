import type { Image } from '$gen/prisma/client/client';
import { prisma } from '$lib/server/prisma';
import { s3 } from '$lib/server/aws';
import { getImageData, getImagePath, useS3 } from '$lib/utils/server';
import { json } from '@sveltejs/kit';
import crypto from 'crypto';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import path from 'path';
import { global } from '$lib/state.svelte';

const supportedMethods = new Set(['get', 'upload', 'delete', 'rename']);

function jsonError(status: number, message: string) {
	return json(
		{
			ok: false,
			error: message,
			status
		},
		{ status }
	);
}

async function handleGet({ url, locals }: { url: URL; locals: App.Locals }) {
	const user = locals.user;
	if (!user) {
		return jsonError(401, 'Unauthorized');
	}

	const journeyId = url.searchParams.get('journeyId');
	if (!journeyId) {
		return jsonError(400, 'Missing journeyId');
	}

	const journey = await prisma.journey.findUnique({
		where: {
			journeyId,
			userId: user.id
		},
		include: {
			image: true
		}
	});

	if (!journey) {
		return jsonError(404, 'Journey not found');
	}

	return json({ ok: true, method: 'get', data: journey.image as Image[], journeyId });
}

async function handleUpload({ request, locals }: { request: Request; locals: App.Locals }) {
	const form = await request.formData();
	const file = form.get('file') as File | null;
	const journeyId = form.get('journeyId') as string | null;

	let id = '';
	let key = '';

	try {
		const user = locals.user;
		if (!user) return jsonError(401, 'Unauthorized');
		if (!file || !journeyId) return jsonError(400, 'Missing data');

		const journey = await prisma.journey.findFirst({ where: { journeyId } });
		if (!journey) return jsonError(404, 'Journey not found');
		if (user.id !== journey.userId) return jsonError(401, 'Unauthorized');

		const buffer = Buffer.from(await file.arrayBuffer());
		id = crypto.randomUUID();
		key = `${journeyId}/${id}`;

		const imgData = await getImageData(file.name, buffer, journeyId);

		if (useS3) {
			await s3.upload({ key, body: buffer });
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

		return json({ ok: true, method: 'upload', data: { id, key }, journeyId });
	} catch (err) {
		console.error(`Failed to add Images: ${err}`);

		if (useS3 && key) {
			await s3.delete({ key }).catch(() => undefined);
		} else if (id && journeyId) {
			const imgPath = getImagePath(id, journeyId);
			await fs.rm(imgPath, { force: true }).catch(() => undefined);
		}

		if (id && (await prisma.image.findUnique({ where: { id } }))) {
			await prisma.image.delete({ where: { id } }).catch(() => undefined);
		}

		return jsonError(500, err instanceof Error ? err.message : 'Unknown error');
	} finally {
		global.loadingJourney = false;
	}
}

async function handleDelete({ request, locals }: { request: Request; locals: App.Locals }) {
	const form = await request.formData();
	const id = form.get('id') as string | null;
	const journeyId = form.get('journeyId') as string | null;

	const key = journeyId && id ? `${journeyId}/${id}` : '';

	try {
		const user = locals.user;
		if (!user) return jsonError(401, 'Unauthorized');
		if (!id || !journeyId) return jsonError(400, 'Missing data');

		const journey = await prisma.journey.findFirst({ where: { journeyId } });
		if (!journey) return jsonError(404, 'Journey not found');
		if (user.id !== journey.userId) return jsonError(401, 'Unauthorized');

		if (useS3) {
			await s3.delete({ key });
		} else {
			const imgPath = path.join(env.IMAGE_FOLDER_PATH, key);
			await fs.rm(imgPath, { force: true });
		}

		await prisma.image.delete({ where: { id } });

		return json({ ok: true, method: 'delete', data: { id, key }, journeyId });
	} catch (err) {
		console.error(`Failed to delete Image: ${err}`);
		return jsonError(500, err instanceof Error ? err.message : 'Unknown error');
	} finally {
		global.loadingJourney = false;
	}
}

async function handleRename({ request, locals }: { request: Request; locals: App.Locals }) {
	const form = await request.formData();
	const imgId = form.get('imgId') as string | null;
	const newName = form.get('newName') as string | null;

	if (!imgId || !newName) {
		return jsonError(400, 'Missing imgId or newName');
	}

	try {
		const user = locals.user;
		if (!user) return jsonError(401, 'Unauthorized');

		const img = await prisma.image.findUnique({
			where: { id: imgId, userId: user.id },
			select: { id: true, journeyId: true }
		});

		if (!img) return jsonError(404, 'Image could not be found in Database');

		await prisma.image.update({
			where: { id: img.id },
			data: { fileName: newName }
		});

		return json({ ok: true, method: 'rename', data: { imgId, newName }, journeyId: img.journeyId });
	} catch (err) {
		console.error(err);
		return jsonError(500, err instanceof Error ? err.message : 'Unknown error');
	}
}

export async function GET({ url, locals }) {
	const method = (url.searchParams.get('method') ?? 'get').toLowerCase();
	if (!supportedMethods.has(method)) {
		return jsonError(400, 'Invalid method');
	}

	if (method !== 'get') {
		return jsonError(405, `Method ${method} is not allowed on GET`);
	}

	return handleGet({ url, locals });
}

export async function POST({ request, url, locals }) {
	const method = (url.searchParams.get('method') ?? '').toLowerCase();
	if (!supportedMethods.has(method)) {
		return jsonError(400, 'Invalid or missing method');
	}

	switch (method) {
		case 'upload':
			return handleUpload({ request, locals });
		case 'delete':
			return handleDelete({ request, locals });
		case 'rename':
			return handleRename({ request, locals });
		default:
			return jsonError(405, `Method ${method} is not allowed on POST`);
	}
}

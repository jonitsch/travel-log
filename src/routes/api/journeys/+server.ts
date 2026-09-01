import { prisma } from '$lib/server/prisma.js';
import { error, json, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import fs from 'fs/promises';
import { s3 } from '$lib/server/aws';
import { useS3 } from '$lib/utils/server';

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

async function handleRename({ request, locals }: { request: Request; locals: App.Locals }) {
	const form = await request.formData();
	const journeyId = form.get('journeyId') as string | null;
	const name = form.get('name') as string | null;

	if (!journeyId || !name) {
		return jsonError(400, 'Missing journeyId or name');
	}

	const trimmedName = name.trim();
	if (!trimmedName) {
		return jsonError(400, 'Journey name cannot be empty');
	}

	const user = locals.user;
	if (!user) {
		return jsonError(401, 'Unauthorized');
	}

	const journey = await prisma.journey.findUnique({
		where: {
			journeyId,
			userId: user.id
		}
	});

	if (!journey) {
		return jsonError(404, 'Journey not found');
	}

	const updated = await prisma.journey.update({
		where: {
			journeyId
		},
		data: {
			name: trimmedName
		}
	});

	return json({
		ok: true,
		method: 'rename',
		data: {
			journeyId: updated.journeyId,
			name: updated.name,
			color: updated.color
		},
		journeyId: updated.journeyId
	});
}

async function handleRecolor({ request, locals }: { request: Request; locals: App.Locals }) {
	const form = await request.formData();
	const journeyId = form.get('journeyId') as string | null;
	const color = form.get('color') as string | null;

	if (!journeyId || !color) {
		return jsonError(400, 'Missing journeyId or color');
	}

	const user = locals.user;
	if (!user) {
		return jsonError(401, 'Unauthorized');
	}

	const journey = await prisma.journey.findUnique({
		where: {
			journeyId,
			userId: user.id
		}
	});

	if (!journey) {
		return jsonError(404, 'Journey not found');
	}

	const updated = await prisma.journey.update({
		where: {
			journeyId
		},
		data: {
			color
		}
	});

	return json({
		ok: true,
		method: 'recolor',
		data: {
			journeyId: updated.journeyId,
			name: updated.name,
			color: updated.color
		},
		journeyId: updated.journeyId
	});
}

async function handleDelete({ request, locals }: { request: Request; locals: App.Locals }) {
	const form = await request.formData();
	const journeyId = form.get('journeyId') as string | null;

	if (!journeyId) {
		return jsonError(400, 'Missing journeyId');
	}

	const user = locals.user;
	if (!user) {
		return jsonError(401, 'Unauthorized');
	}

	const journey = await prisma.journey.findUnique({
		where: {
			journeyId,
			userId: user.id
		}
	});

	if (!journey) {
		return jsonError(404, 'Journey not found');
	}

	const deleted = await prisma.journey.delete({
		where: {
			journeyId
		}
	});

	if (!useS3) {
		const imageFolder = env.IMAGE_FOLDER_PATH + journeyId;
		await fs.rm(imageFolder, { recursive: true, force: true });
	} else {
		await s3.deletePrefix({ prefix: `${journeyId}/` });
	}

	return json({
		ok: true,
		method: 'delete',
		data: {
			journeyId: deleted.journeyId,
			name: deleted.name,
			color: deleted.color
		},
		journeyId: deleted.journeyId
	});
}

export async function GET({ url, locals }) {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/auth/login');
	}

	const journeyId = url.searchParams.get('journeyId');
	if (!journeyId) {
		throw error(400, 'Missing journeyId');
	}

	try {
		const journey = await prisma.journey.findUnique({
			include: {
				marker: true,
				image: true
			},
			where: {
				journeyId: journeyId,
				userId: user.id
			}
		});

		if (!journey) return error(404, 'Journey not found');
		return json(journey);
	} catch (err) {
		console.error('Error fetching journey data:', err);
		return error(500, 'Internal Server Error');
	}
}

export async function POST({ request, url, locals }) {
	const method = (url.searchParams.get('method') ?? '').toLowerCase();

	if (!method) {
		return jsonError(400, 'Missing method');
	}

	switch (method) {
		case 'rename':
			return handleRename({ request, locals });
		case 'recolor':
			return handleRecolor({ request, locals });
		case 'delete':
			return handleDelete({ request, locals });
		default:
			return jsonError(400, `Unsupported method: ${method}`);
	}
}

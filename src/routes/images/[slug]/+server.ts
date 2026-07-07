import { readFileSync } from 'fs';
import { prisma } from '$lib/server/prisma.js';
import { redirect } from '@sveltejs/kit';
import { s3 } from '$lib/server/aws.js';
import { getImagePath } from '$lib/utils/server.js';
import { dev } from '$app/environment';

export const GET = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/auth/login');
	}

	const id = params.slug;
	
	console.log('Attempting to access image id: ' + id);

	const img = await prisma.image.findUnique({
		where: {
			id: id,
			userId: user.id
		},
		select: {
			journeyId: true,
			id: true
		}
	});
	if (!img) throw new Error('Image either does not exist or does not belong to the user!');

	let file: BodyInit;

	if (dev) {
		const imgPath = getImagePath(img.id, img.journeyId);
		file = readFileSync(imgPath);
	} else {
		const response = await s3.get({ key: img.journeyId + '/' + img.id });
		if (!response?.Body) throw Error('No valid image data received from S3-Bucket!');
		const byteArray = await response.Body.transformToByteArray();

		file = Buffer.from(byteArray);
	}

	if (!file) throw Error('404: File not found!');

	return new Response(file);
};

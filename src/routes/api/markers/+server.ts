import type { Marker } from '$gen/prisma/client/client';
import { prisma } from '$lib/server/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
	const journeyIdString = journeyId.url.search.split('=')[1];
	const markers: Marker[] = await prisma.marker.findMany({
		where: {
			journeyId: journeyIdString
		}
	});
	return json(markers);
}

import type { Marker } from '$gen/prisma/client/client';
import { prisma } from '$src/lib/server/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
  let journeyIdString = journeyId.url.search.split('=')[1]
  let markers: Marker[] = await prisma.marker.findMany({
    where: {
      journeyId: journeyIdString
    }
  }
  );
  return json(markers);
}

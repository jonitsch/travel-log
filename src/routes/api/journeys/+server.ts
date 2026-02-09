import type { Journey, Marker, Image } from '$gen/prisma/client/client';
import { prisma } from '$src/lib/server/prisma.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
  let journeyIdString = journeyId.url.search.split('=')[1]
  const journey: Journey & { marker: Marker[], image: Image[] } | null =
    await prisma.journey.findUnique({
      include: {
        marker: true,
        image: true,
      },
      where: {
        journeyId: journeyIdString
      }
    })
  return json(journey);
}

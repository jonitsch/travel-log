import { prisma } from '$src/lib/server/prisma.js';
import type { JourneyData } from '$src/lib/state.svelte.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
  let journeyIdString = journeyId.url.search.split('=')[1]
  const journey: JourneyData =
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

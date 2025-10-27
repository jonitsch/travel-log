import { prisma } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
  let journeyIdString = journeyId.url.search.split('=')[1]
  console.log(journeyIdString)
  const journey = await prisma.journey.findUnique({
    include: {
      marker: true
    },
    where: {
      journeyId: journeyIdString
    }
  })
  return json(journey);
}

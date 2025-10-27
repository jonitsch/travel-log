import { prisma } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export async function GET(journeyId) {
  let journeyIdString = journeyId.url.search.split('=')[1]
  let markers = await prisma.marker.findMany(
    {
      include: {
        journey: {
          select: {
            color: true
          }
        }
      },
      where: {
        journeyId: journeyIdString
      }
    }
  );
  return json(markers);
}

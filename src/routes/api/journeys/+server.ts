import { prisma } from '$lib/server/prisma.js';
import type { JourneyData } from '$lib/state.svelte.js';
import { error, json, redirect } from '@sveltejs/kit';

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
        image: true,
      },
      where: {
        journeyId: journeyId,
        userId: user.id,
      }
    });

    if (!journey) return error(404, 'Journey not found');
    return json(journey);
  } catch (err) {
    console.error('Error fetching journey data:', err);
    return error(500, 'Internal Server Error');
  }
}

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

  const journey: JourneyData =
    await prisma.journey.findUnique({
      include: {
        marker: true,
        image: true,
      },
      where: {
        journeyId: journeyId
      }
    })
  return json(journey);
}

import { prisma } from '$lib/server/database.js';
import { json } from '@sveltejs/kit';

export async function GET() {
  const users = await prisma.journey.findMany();
  return json(users);
}

export async function POST({ request }) {
  const { name, email } = await request.json();
  const user = await prisma.users.create({
    data: { name, email }
  });
  return json(user);
}

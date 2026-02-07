import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';  // ✅ Correct import

export const GET = svelteKitHandler(auth);
export const POST = svelteKitHandler(auth);

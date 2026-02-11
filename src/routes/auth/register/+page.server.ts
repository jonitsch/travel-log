import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(5),
    email: z.email(),
    password: z.string().min(8),
});

export const load = (async () => {
    const form = await superValidate(zod4(schema));
    
    if (!form.valid) {
        return fail(400, {
            form
        })
    }
    return { form };
}) satisfies PageServerLoad;
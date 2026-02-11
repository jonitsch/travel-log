import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { auth } from '$src/lib/server/auth';
import { prisma } from '$lib/server/prisma';

const schema = z.object({
    name: z.string().min(4),
    email: z.string(),
    password: z.string().min(8),
});

export const load: PageServerLoad = (async () => {
    const form = await superValidate(zod4(schema));
    return { form };
});

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, zod4(schema));
        const { name, email, password } = form.data;

        if (await prisma.user.findUnique({ where: { email } })) {
            form.errors.email = ["Email is already in use"]
            return fail(400, {
                form,
            })
        }
        if (!form.valid) {
            console.log('test')
            return fail(400, { form });
        }
        try {
            await auth.api.signUpEmail({
                body: {
                    name,
                    email,
                    password,
                }
            });
        } catch (e) {
            return fail(400, { form });
        }

        return { form };
    }
};
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';

const allowedEmails: string[] | undefined = env.ALLOWED_EMAILS
  ? Array.from(JSON.parse(env.ALLOWED_EMAILS))
  : undefined

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

        if (!form.valid) return fail(400, { form });

        if (allowedEmails && !allowedEmails.includes(email)) {
            form.errors.email = ["Access Denied"];
            return fail(400, { form });
        }
        if (await prisma.user.findUnique({ where: { email } })) {
            form.errors.email = ["Email is already in use!"];
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
        } catch (err) {
            return message(form, err, { status: 500 });
        }

        redirect(300, '/auth/login');
    }
};
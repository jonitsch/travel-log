import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { auth } from '$lib/server/auth';
import { prisma } from '$lib/server/prisma';

const schema = z.object({
	email: z.email(),
	password: z.string(),
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(schema));
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(schema));
		const { email, password } = form.data;

		if (!form.valid) {
			return fail(400, { form });
		}
		const user = await prisma.user.findUnique({
			where: { email }
		})
		console.log(user);
		if (!user) {
			form.valid = false;
			return message(form, 'User not found!');
		}
		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
				},
				headers: request.headers,
				method: 'POST',
			});
		} catch (err: any) {
			console.log(`Login for user ${email} failed!`);
			console.error(err);
			return fail(500, { message: 'Login failed' });
		}
		console.log(`Login for user ${email} was successful!`);
		throw redirect(303, '/map');
	}
};

import { env } from '$env/dynamic/private';
import { MailtrapClient } from 'mailtrap';

export async function sendPasswordResetEmail(to: string, url: string) {
	if (!env.MAILTRAP_API_KEY || !env.MAILTRAP_FROM_EMAIL) {
		throw new Error('MAILTRAP_API_KEY and MAILTRAP_FROM_EMAIL must be configured');
	}

	const mailtrap = new MailtrapClient({
		token: env.MAILTRAP_API_KEY
	});

	await mailtrap.send({
		from: {
			email: env.MAILTRAP_FROM_EMAIL,
			name: env.MAILTRAP_FROM_NAME ?? 'Travel Log'
		},
		to: [{ email: to }],
		subject: 'Reset your Travel Log password',
		text: `Reset your Travel Log password by opening this link: ${url}`,
		html: `
			<p>Reset your Travel Log password by clicking the link below:</p>
			<p><a href="${url}">Reset your password</a></p>
			<p>If you did not request this, you can safely ignore this email.</p>
		`
	});
}

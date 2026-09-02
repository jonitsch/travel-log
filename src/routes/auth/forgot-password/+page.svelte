<script lang="ts">
	import { Button } from '$lib/components/shadcn/button';
	import * as Card from '$lib/components/shadcn/card';
	import { Input } from '$lib/components/shadcn/input';
	import { Label } from '$lib/components/shadcn/label';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let message = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	async function handleRequestReset() {
		message = '';
		errorMessage = '';
		isSubmitting = true;

		try {
			const { error } = await authClient.requestPasswordReset({
				email,
				redirectTo: `${window.location.origin}/auth/reset-password`
			});

			if (error) {
				errorMessage = error.message ?? 'Unable to request a password reset.';
				return;
			}

			message = 'If an account exists for this email, a password reset link has been sent.';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to request a password reset.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form
	id="main"
	class="animate-modal-in mt-15 flex size-full flex-row items-start justify-center gap-4"
	onsubmit={(event) => {
		event.preventDefault();
		void handleRequestReset();
	}}
>
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title>Forgot your password?</Card.Title>
			<Card.Description>Enter your email and we’ll send you a password reset link.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					name="email"
					placeholder="example@example.com"
					bind:value={email}
					required
				/>
			</div>
		</Card.Content>
		<Card.Footer class="flex-col gap-2">
			<Button type="submit" class="w-full" disabled={isSubmitting}>
				{isSubmitting ? 'Sending...' : 'Send reset link'}
			</Button>
			{#if message}<div class="text-sm text-green-600">{message}</div>{/if}
			{#if errorMessage}<div class="text-sm text-red-600">{errorMessage}</div>{/if}
			<Button variant="link" class="w-full" href="/auth/login">Back to login</Button>
		</Card.Footer>
	</Card.Root>
</form>

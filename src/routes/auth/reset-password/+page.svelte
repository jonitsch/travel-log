<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/shadcn/button';
	import * as Card from '$lib/components/shadcn/card';
	import { Input } from '$lib/components/shadcn/input';
	import { Label } from '$lib/components/shadcn/label';
	import { authClient } from '$lib/auth-client';

	let token = $state<string | null>(null);
	let newPassword = $state('');
	let confirmPassword = $state('');
	let errorMessage = $state('');
	let isSubmitting = $state(false);
	let isInvalidToken = $state(false);

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		token = params.get('token');
		const tokenError = params.get('error');

		if (!token || tokenError) {
			isInvalidToken = true;
			errorMessage = tokenError
				? 'This password reset link is invalid or expired.'
				: 'This password reset link is missing its token.';
		}
	});

	async function handleResetPassword() {
		errorMessage = '';

		if (!token) {
			isInvalidToken = true;
			errorMessage = 'This password reset link is invalid or expired.';
			return;
		}

		if (newPassword.length < 8) {
			errorMessage = 'Your password must be at least 8 characters long.';
			return;
		}

		if (newPassword !== confirmPassword) {
			errorMessage = 'The passwords do not match.';
			return;
		}

		isSubmitting = true;
		try {
			const { error } = await authClient.resetPassword({
				newPassword,
				token
			});

			if (error) {
				errorMessage = error.message ?? 'Unable to reset your password.';
				return;
			}

			await goto('/auth/login?reset=success');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to reset your password.';
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
		void handleResetPassword();
	}}
>
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title>Reset your password</Card.Title>
			<Card.Description>Choose a new password for your Travel Log account.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if isInvalidToken}
				<div class="text-sm text-red-600">{errorMessage}</div>
			{:else}
				<div class="flex flex-col gap-4">
					<div class="grid gap-2">
						<Label for="new-password">New password</Label>
						<Input
							id="new-password"
							type="password"
							name="new-password"
							bind:value={newPassword}
							minlength={8}
							required
						/>
					</div>
					<div class="grid gap-2">
						<Label for="confirm-password">Confirm password</Label>
						<Input
							id="confirm-password"
							type="password"
							name="confirm-password"
							bind:value={confirmPassword}
							minlength={8}
							required
						/>
					</div>
					{#if errorMessage}<div class="text-sm text-red-600">{errorMessage}</div>{/if}
				</div>
			{/if}
		</Card.Content>
		<Card.Footer class="flex-col gap-2">
			{#if isInvalidToken}
				<Button class="w-full" href="/auth/forgot-password">Request a new link</Button>
			{:else}
				<Button type="submit" class="w-full" disabled={isSubmitting}>
					{isSubmitting ? 'Resetting...' : 'Reset password'}
				</Button>
			{/if}
			<Button variant="link" class="w-full" href="/auth/login">Back to login</Button>
		</Card.Footer>
	</Card.Root>
</form>

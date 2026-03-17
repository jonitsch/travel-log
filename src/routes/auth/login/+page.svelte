<script lang="ts">
	import { Button } from '$lib/components/shadcn/button';
	import * as Card from '$lib/components/shadcn/card';
	import { Input } from '$lib/components/shadcn/input';
	import { Label } from '$lib/components/shadcn/label';
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let email = $state(''),
		password = $state(''),
		message = $state();

	async function handleSignin() {
		try {
			const { error } = await authClient.signIn.email({ email, password });
			if (error) message = error.message;
			await invalidateAll();
			goto('/map');
		} catch (err) {
			message = 'Something went wrong!';
			throw err;
		}
	}
</script>

<form
	id="main"
	class="animate-modal-in mt-15 flex size-full flex-row items-start justify-center gap-4"
	onsubmit={() => handleSignin()}
>
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title>Login</Card.Title>
			<Card.Description>Enter your email and password to login to your account!</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						type="email"
						name="email"
						placeholder="example@example.com"
						bind:value={email}
						required
					/>
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
						<a href="##" class="ms-auto inline-block text-sm underline-offset-4 hover:underline">
							Forgot your password?
						</a>
					</div>
					<Input type="password" name="password" bind:value={password} required />
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="flex-col gap-2">
			<Button type="submit" class="w-full">Login</Button>
			{#if message}<div class="text-sm text-red-600">{message}</div>{/if}
			<Button variant="link" class="w-full" href="/auth/register"
				>Dont have an acccount? Create One!
			</Button>
		</Card.Footer>
	</Card.Root>
</form>

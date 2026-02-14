<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/shadcn/button/index.js';
	import { Label } from '$lib/components/shadcn/label/index.js';
	import { Input } from '$lib/components/shadcn/input/index.js';
	import * as Card from '$lib/components/shadcn/card/index.js';

	let email = $state<string>(''),
		password = $state<string>(''),
		error = $state();

	async function handleSignin() {
		try {
			await authClient.signIn.email({ email, password });
			await invalidateAll();
			goto('/map');
		} catch (err: any) {
			error = err.message || 'Login failed';
		}
	}
</script>

<form
	class="animate-modal-in flex size-full flex-row items-start mt-15 justify-center gap-4"
	onsubmit={(e) => {
		e.preventDefault();
		handleSignin();
	}}
>
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title>Login to your account</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
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
					<Input id="password" type="password" bind:value={password} required />
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="flex-col gap-2">
			<Button type="submit" class="w-full">Login</Button>
			<Button variant="link" href="/auth/register" class="w-full"
				>Dont have an account? Sign up</Button
			>
		</Card.Footer>
	</Card.Root>
</form>

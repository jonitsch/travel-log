<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$src/lib/components/shadcn/button';
	import * as Card from '$src/lib/components/shadcn/card';
	import { Input } from '$src/lib/components/shadcn/input';
	import { Label } from '$src/lib/components/shadcn/label';

	let name = $state<string>(''),
		email = $state<string>(''),
		password = $state<string>(''),
		error = $state();

	async function handleSignup() {
		try {
			await authClient.signUp.email({
				email,
				password,
				name
			});
			await invalidateAll();
			goto('/auth/login');
		} catch (err: any) {
			error = err.message || 'Signup failed';
		}
	}
</script>

<form
	id="main"
	class="flex size-full flex-row items-center justify-center gap-4 animate-modal-in"
	onsubmit={(e) => {
		e.preventDefault();
		handleSignup();
	}}
>
	<Card.Root class="-my-4 w-full max-w-sm">
		<Card.Header>
			<Card.Title>Create a new Account</Card.Title>
			<Card.Description>Enter your name, email and password to create an account!</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input id="name" type="name" bind:value={name} required />
				</div>
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
			<Button type="submit" class="w-full">Sign Up</Button>
			<Button variant="link" class="w-full" href="/auth/login">Already have an acccount? Login</Button>
		</Card.Footer>
	</Card.Root>
</form>

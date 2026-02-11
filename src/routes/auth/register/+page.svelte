<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$src/lib/components/shadcn/button';
	import * as Card from '$src/lib/components/shadcn/card';
	import { Input } from '$src/lib/components/shadcn/input';
	import { Label } from '$src/lib/components/shadcn/label';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, constraints, message, enhance } = superForm(data.form);

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

{#if $message}<h3>{$message}</h3>{/if}

<form
	id="main"
	class="animate-modal-in flex size-full flex-row items-start mt-4 justify-center gap-4"
	method="POST"
	use:enhance
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
					<Input
						id="name"
						type="name"
						name="name"
						bind:value={$form.name}
						aria-invalid={$errors.name ? 'true' : undefined}
						{...$constraints.name}
						required
					/>
					{#if $errors.name}
						<small class="text-red-600">{$errors.name}</small>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						name="email"
						placeholder="example@example.com"
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
						{...$constraints.email}
						required
					/>
					{#if $errors.email}
						<small class="text-red-600 flex justify-between"
							>{$errors.email}
							{#if $errors.email.join() === 'Email is already in use'}
								<a href="/auth/login" class="text-white ml-3 underline"> Login instead?</a>
							{/if}
						</small>
					{/if}
				</div>
				<div class="grid gap-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
						<a href="##" class="ms-auto inline-block text-sm underline-offset-4 hover:underline">
							Forgot your password?
						</a>
					</div>
					<Input
						id="password"
						type="password"
						name="password"
						bind:value={$form.password}
						aria-invalid={$errors.password ? 'true' : undefined}
						{...$constraints.password}
						required
					/>
					{#if $errors.password}
						<small class="text-red-600">{$errors.password}</small>
					{/if}
				</div>
			</div>
		</Card.Content>
		<Card.Footer class="flex-col gap-2">
			<Button type="submit" class="w-full">Sign Up</Button>
			<Button variant="link" class="w-full" href="/auth/login"
				>Already have an acccount? Login</Button
			>
		</Card.Footer>
	</Card.Root>
</form>

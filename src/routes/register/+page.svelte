<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let name = $state<string>(''),
		email = $state<string>(''),
		password = $state<string>(''),
		error = $state();

	async function handleSignup() {
		try {
			const res = await authClient.signUp.email({
				email,
				password,
				name
			});
			goto('/');
		} catch (err: any) {
			error = err.message || 'Signup failed';
		}
	}
</script>

<h1>Sign in</h1>
<form
	onsubmit={(e) => {
		e.preventDefault();
		handleSignup();
	}}
>
	<input bind:value={name} type="name" placeholder="Name" required />
	<input bind:value={email} type="email" placeholder="Email" required />
	<input bind:value={password} type="password" placeholder="Password" required />
	<button type="submit">Sign Up</button>
	{#if error}<p>{error}</p>{/if}
</form>
<br />
<a href="/login">Already have an account? Sign in</a>

<style>
	* {
		color: white;
	}
	input {
		border: solid 2px white;
	}
</style>

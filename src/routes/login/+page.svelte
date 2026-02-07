<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let email = $state<string>(''),
		password = $state<string>(''),
		error = $state();

	async function handleSignin() {
		try {
			await authClient.signIn.email({ email, password });
			goto('/');
		} catch (err: any) {
			error = err.message || 'Login failed';
		}
	}
</script>

<h1>Sign in</h1>
<form onsubmit={(e) => {
	e.preventDefault();
	handleSignin();
}}>
	<label for="email">email</label>
	<input name="email" id="email" bind:value={email} /><br />

	<label for="password">Password</label>
	<input type="password" name="password" id="password" bind:value={password} /><br />

	<button type="submit">Continue</button>
	{#if error}<p>{error}</p>{/if}
	<br>
	<a href="/register">Don't have an account? Register</a>
</form>

<style>
	* {
		color: white;
	}
	input {
		border: solid 2px white;
	}
</style>

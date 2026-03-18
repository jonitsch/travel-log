<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { global } from '$lib/state.svelte';
	import { switchToJourney, switchToOverview } from '$lib/utils/client';
	import type { PageData } from './$types';
	import { type Snippet } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import type { User } from 'better-auth';
	import SVGIcon from '$lib/components/SVGIcon.svelte';
	import { fade } from 'svelte/transition';
	import ProfileMenu from '$lib/components/ProfileMenu.svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
	let displayMode: string | undefined = $state('');
	let user = $derived<User | null>(data.user);

	if (browser) {
		displayMode = document.getElementById('html')?.className;
	}

	async function handleSignOut() {
		try {
			global.viewMode = 'overview';
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						await invalidateAll();
						goto('/');
					}
				}
			});
		} catch (err) {
			throw err;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="inset-0 flex h-screen w-screen flex-col gap-3 overflow-auto p-3">
	<div
		id="header"
		class="flex h-fit w-full items-center justify-between gap-2 rounded-md bg-transparent whitespace-nowrap"
	>
		<!-- Left: Title/Logo -->
		<div class="flex min-w-0 flex-1 flex-row items-center justify-start gap-2">
			{#if true}
				<div id="mainHeader" class="items-center bg-transparent">
					<button
						id="headerText"
						class="oxygen-bold page-header-button bg-gray-900"
						onclick={() => (user ? switchToOverview() : goto('/'))}
					>
						<text class="">Travel Log</text>
					</button>
				</div>
			{/if}
			{#if global.viewMode === 'journey'}
				{@const journey = global.journeyData}
				<div
					id="journeyHeader"
					class="before:mr-2 before:text-[22px] before:text-white before:content-['/']"
				>
					<button
						id="headerText"
						class="oxygen-bold page-header-button bg-{journey?.color}/70 whitespace-nowrap {global.loadingJourney
							? 'skeleton text-transparent'
							: 'text-white'}"
						onclick={() => switchToJourney(journey?.journeyId ?? '')}
					>
						{journey?.name ?? 'Placeholder'}
					</button>
				</div>
			{/if}
		</div>

		<!-- Center: Welcome -->
		{#if user && global.viewMode === 'overview'}
			<div class="flex flex-1 items-center justify-center" transition:fade={{ duration: 150 }}>
				<div class="text-center">Welcome, {user.name}!</div>
			</div>
		{/if}

		<!-- Right: Auth buttons -->
		<div class="flex flex-1 min-w-0 flex-row items-center justify-end gap-2">
			{#if user}
				<ProfileMenu name={user.name} />
			{:else}
				<div id="loginButton" class="flex w-fit items-center">
					<a href="/auth/login" class="oxygen-bold page-header-button bg-gray-900">Login</a>
				</div>
			{/if}
		</div>
	</div>

	<div id="content" class="flex-auto overflow-hidden">
		{@render children?.()}
	</div>
	<div class="group ml-auto w-fit text-[9.5px] text-gray-500">
		Für Tamina und Joni
		<text id="heart" class="invisible ml-0.5 cursor-pointer text-red-400 group-hover:visible">
			♥
		</text>
	</div>
</div>

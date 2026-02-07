<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { global } from '$lib/state.svelte';
	import { switchToJourneyMode, switchToOverview } from '$src/lib/utils';
	import type { PageData } from './$types';
	import type { Snippet } from 'svelte';
	import { authClient } from '$src/lib/auth-client';
	import { goto } from '$app/navigation';

	let { children, data }: { children: Snippet; data: PageData } = $props();
	let displayMode: string | undefined = $state('');

	console.log(data.user);

	if (browser) {
		displayMode = document.getElementById('html')?.className;
	}

	async function handleSignOut() {
		try {
			await authClient.signOut();
			goto('/login');
		} catch (err) {
			throw err;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="inset-0 flex h-screen w-screen flex-col gap-3 overflow-auto p-3">
	<div id="header" class="flex h-fit flex-row items-center gap-2 rounded-md bg-gray-950/50">
		{#if true}
			<div id="mainHeader" class="items-center bg-transparent">
				<button
					id="headerText"
					class="oxygen-bold page-header-button bg-gray-900"
					onclick={() => switchToOverview()}
				>
					<text class="">Travel Log</text>
				</button>
			</div>
		{/if}
		{#if global.viewMode === 'journey'}
			{@const journey = global.journeyData}
			<div
				id="journeyHeader"
				class="before:mr-2 before:text-2xl before:text-white before:content-['/']"
			>
				<button
					id="headerText"
					class="oxygen-bold animate-slide-left page-header-button bg-{global.journeyData?.color ??
						'bg-black'}/70 whitespace-nowrap"
					onclick={() => switchToJourneyMode(journey?.journeyId ?? '')}
				>
					{global.journeyData?.name}
				</button>
			</div>
		{/if}
		{#if data.user}
			<div id="signOutButton" class="ml-auto w-fit items-center bg-transparent">
				<form
					onsubmit={(e) => {
						e.preventDefault;
						handleSignOut();
					}}
				>
					<button type="submit" class="oxygen-bold page-header-button bg-gray-900">
						Sign Out
					</button>
				</form>
			</div>
		{:else}
			<div id="Login" class="ml-auto w-fit items-center bg-transparent">
				<a href="/login" class="oxygen-bold page-header-button bg-gray-900">Login</a>
			</div>
		{/if}
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

<script lang="ts">
	import '$src/app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { global } from '$lib/state.svelte';
	import { switchToJourneyMode, switchToOverview } from '$src/lib/utils';
	import type { PageData } from './$types';
	import { type Snippet } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import type { User } from 'better-auth';
	import SVGIcon from '$src/lib/components/SVGIcon.svelte';

	let { children, data }: { children: Snippet; data: PageData } = $props();
	let displayMode: string | undefined = $state('');
	let user = $derived<User | null>(data.user);

	if (browser) {
		displayMode = document.getElementById('html')?.className;
	}

	async function handleSignOut() {
		try {
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
	$inspect(user);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="inset-0 flex h-screen w-screen flex-col gap-3 overflow-auto p-3">
	<div
		id="header"
		class="flex h-fit flex-row items-center justify-between gap-2 rounded-md bg-transparent w-full"
	>
		<div class="flex flex-row items-center gap-2">
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
					class="before:mr-2 before:text-2xl before:text-white before:content-['/']"
				>
					<button
						id="headerText"
						class="oxygen-bold animate-slide-left page-header-button bg-{global.journeyData
							?.color ?? 'bg-black'}/70 whitespace-nowrap"
						onclick={() => switchToJourneyMode(journey?.journeyId ?? '')}
					>
						{global.journeyData?.name}
					</button>
				</div>
			{/if}
		</div>
		{#if user}
			<div class="">Welcome, {user.name}!</div>
			<div id="signOutButton" class="w-fit items-center mr-0">
				<form
					onsubmit={(e) => {
						e.preventDefault;
						handleSignOut();
					}}
				>
					<button
						type="submit"
						class="oxygen-bold flex page-header-button flex-row items-center gap-2 bg-gray-900"
					>
						<SVGIcon type="signOut" fill="white" hoverScale={false} scale={0.9} />
						Sign Out
					</button>
				</form>
			</div>
		{:else}
			<div id="loginButton" class="flex-auto w-fit items-center mr-0">
				<a href="/auth/login" class="oxygen-bold page-header-button bg-gray-900">Login</a>
			</div>
		{/if}
	</div>
	<div id="content" class="flex-auto overflow-hidden">
		{@render children?.()}
	</div>
	<div class="group -z-1 ml-auto w-fit text-[9.5px] text-gray-500">
		Für Tamina und Joni
		<text id="heart" class="invisible ml-0.5 cursor-pointer text-red-400 group-hover:visible">
			♥
		</text>
	</div>
</div>

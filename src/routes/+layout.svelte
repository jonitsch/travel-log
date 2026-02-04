<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { global } from '$lib/state.svelte';
	import { slide } from 'svelte/transition';
	import { switchToJourneyMode, switchToOverview } from '$src/lib/utils';

	let { children } = $props();
	let displayMode: string | undefined = $state('');
	let headerStyle =
		'oxygen-bold text-1xl w-fit rounded-md p-3 leading-tight text-gray-50';

	if (browser) {
		displayMode = document.getElementById('html')?.className;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="inset-0 flex h-[100vh] w-[100vw] flex-col overflow-auto p-3 gap-3">
	<div id="header" class="flex h-fit flex-row items-center bg-gray-950/50 rounded-md">
		{#if true}
			<div id="mainHeader" class="items-center bg-transparent">
				<button
					id="headerText"
					class="{headerStyle} bg-gray-900"
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
				class="before:ml-2 before:mr-2 before:text-2xl before:text-white before:content-['/']"
			>
				<button
					id="headerText"
					class="animate-slide-left  {headerStyle} bg-{global.journeyData?.color ?? 'bg-black'}/70 whitespace-nowrap"
					onclick={() => switchToJourneyMode(journey?.journeyId ?? '')}
				>
					{global.journeyData?.name}
				</button>
			</div>
		{/if}
		<div id="resetButton" class="ml-auto w-fit items-center bg-transparent">
			<button onclick={() => switchToOverview()} class="{headerStyle} bg-gray-900"> Reset </button>
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

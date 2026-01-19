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
		'oxygen-bold text-1xl w-fit rounded-md p-3 leading-tight text-gray-50 shadow-xl';

	if (browser) {
		displayMode = document.getElementById('html')?.className;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="inset-0 flex h-[100vh] w-[100vw] flex-col overflow-auto p-5">
	<div id="header" class="z-999 flex flex-shrink-0 flex-row items-start">
		{#if true}
			<div id="header" class="group w-fit items-center bg-transparent pb-5">
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
				transition:slide={{ axis: 'y' }}
				id="journeyHeader"
				class="pb-2 before:ml-2 before:mr-2 before:text-2xl before:text-white before:content-['/']"
			>
				<button
					id="headerText"
					class="{headerStyle} bg-{global.journeyData?.color ?? 'bg-black'}/70 whitespace-nowrap"
					onclick={() => switchToJourneyMode(journey?.journeyId ?? '')}
				>
					{global.journeyData?.name}
				</button>
			</div>
		{/if}
		<div id="resetButton" class="ml-auto w-fit items-center bg-transparent pb-5">
			<button onclick={() => switchToOverview()} class="{headerStyle} bg-gray-900"> Reset </button>
		</div>
	</div>
	<div id="content" class="flex-auto overflow-hidden">
		{@render children?.()}
	</div>
	<div class="group my-1 ml-auto w-fit text-[9.5px] text-gray-500">
		Für Tamina und Joni
		<text id="heart" class="invisible ml-0.5 cursor-pointer text-red-400 group-hover:visible">
			♥
		</text>
	</div>
</div>

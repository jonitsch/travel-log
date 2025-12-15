<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { browser } from '$app/environment';
	import { global } from '$lib/state.svelte';

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

<div id="main" class="absolute h-full w-full overflow-hidden p-5">
	<div id="content" class="z-999 absolute inset-0 h-full w-full">
		{@render children?.()}
	</div>
	<div class="absolute flex flex-row items-start">
		{#if true}
			<div id="header" class="w-fit items-center bg-transparent group">
				<button id="headerText" class="{headerStyle} bg-gray-900"
				onclick={() => global.viewMode = "overview"}> Travel Log </button>
				<div class="invisible group m-1 ml-1 w-fit text-[9.5px] text-gray-500 group-hover:visible">
					Für Tamina und Joni
					<text id="heart" class="invisible ml-0.5 cursor-pointer text-red-400 group-hover:visible"
						>♥</text
					>
				</div>
			</div>
		{/if}
		{#if global.viewMode === 'journey'}
			<div
				id="journeyHeader"
				class="before:ml-2 before:mr-2 before:text-2xl before:text-white before:content-['/']"
			>
				<button
					id="headerText"
					class="{headerStyle} {global.journeyData?.color ?? 'bg-black'} whitespace-nowrap"
				>
					{global.journeyData?.name}
				</button>
			</div>
		{/if}
	</div>
</div>

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

	function resetToOverview() {
		global.viewMode = null;
		global.viewMode = 'overview';
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="absolute inset-0 flex h-full w-full flex-col overflow-hidden p-5">
	<div id="header" class="z-999 flex flex-shrink-0 flex-row items-start">
		{#if true}
			<div id="header" class="group w-fit items-center bg-transparent pb-5">
				<button
					id="headerText"
					class="{headerStyle} bg-gray-900"
					onclick={() => resetToOverview()}
				>
					<text class="">Travel Log</text>
				</button>
			</div>
		{/if}
		{#if global.viewMode === 'journey'}
			<div
				id="journeyHeader"
				class="pb-2 before:ml-2 before:mr-2 before:text-2xl before:text-white before:content-['/']"
			>
				<button
					id="headerText"
					class="{headerStyle} {global.journeyData?.color ?? 'bg-black'}/50 whitespace-nowrap"
				>
					{global.journeyData?.name}
				</button>
			</div>
		{/if}
		<div id="resetButton" class="group ml-auto w-fit items-center bg-transparent pb-5">
			<button
				onclick={() => resetToOverview()}
				class="{headerStyle} bg-gray-900"
			>
				Reset
			</button>
		</div>
	</div>
	<div id="content" class="flex-1 overflow-hidden">
		{@render children?.()}
	</div>
	<div class="group m-1 ml-1 w-fit text-[9.5px] text-gray-500 hover:visible">
		Für Tamina und Joni
		<text id="heart" class="invisible ml-0.5 cursor-pointer text-red-400 group-hover:visible">
			♥
		</text>
	</div>
</div>

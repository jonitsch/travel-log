<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { type Markers } from '$lib/server/database';
	import type { PageProps } from './$types';
	import CreateJourneyModal from '$lib/components/CreateJourneyModal.svelte';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();
	let markers: Markers = $state([]);
	async function loadData() {
		console.log('loading Data...');
		markers = await data.markers;
		markers = markers;
		console.log('Data loaded');
	}
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let currentJourneyId = $state('default');
	onMount(() => {
		loadData();
	});
</script>

<div class="absolute z-5 mt-5">
	<div class="min-w-[fit-content] flex-row justify-start *:h-fit *:whitespace-nowrap">
		<div class="flex-1">
			<div
				id="navWrapper"
				class="absolute top-[5rem] ml-1 h-full flex-row transition *:filter first:my-0 [&>*:not(:first-child)]:mt-4"
			></div>
		</div>
	</div>
</div>

<div class="absolute">
	<div id="map" class="h-[100vh] w-[100vw] overflow-hidden" bind:this={mapContainer}>
		<Map bind:map={map!} bind:mapContainer bind:data onload={loadData} {currentJourneyId} />
	</div>
</div>

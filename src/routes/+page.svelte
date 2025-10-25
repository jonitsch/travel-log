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
	let currentJourney = $state('default');
	onMount(() => {
		loadData();
	});

	let zoom: number = $state(1.5);
</script>

<div id="zoomDisplay" class="absolute right-[15px] top-[15px]">
{zoom.toPrecision(3)}
</div>

<div class="absolute">
	<div id="map" class="h-[100vh] w-[100vw] overflow-hidden" bind:this={mapContainer}>
		<Map bind:map={map!} bind:mapContainer bind:data onload={loadData} {currentJourney} />
	</div>
</div>

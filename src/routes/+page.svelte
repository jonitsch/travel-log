<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import CreateJourneyModal from '$lib/components/CreateJourneyModal.svelte';
	import { type Markers } from '$lib/server/database';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let markers: Markers = $state([]);
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let currentJourney = $state('default');
</script>

<div class="absolute">
	<div id="map" class="h-screen w-screen overflow-hidden" bind:this={mapContainer}>
		<Map bind:map={map!} bind:mapContainer bind:data />
	</div>
</div>

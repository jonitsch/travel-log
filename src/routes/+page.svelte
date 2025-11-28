<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
</script>

<div class="absolute">
	<div id="map" class="h-screen w-screen overflow-hidden" bind:this={mapContainer}>
		<Map bind:map={map!} bind:mapContainer bind:data />
	</div>
</div>

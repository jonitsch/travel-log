<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let book = $state<HTMLDivElement>();
	let currentJourneyData = $state<{
		journeyId: string;
		name: string;
		color: string;
		lng: number;
		lat: number;
		marker: {
			journeyId: string;
			name: string;
			color: string;
			lng: number;
			lat: number;
			id: number;
		}[];
		image: {
			journeyId: string;
			lng: number | null;
			lat: number | null;
			path: string;
			fileName: string;
			width: number;
			height: number;
		}[];
	}>();
	let viewMode: string = $state('overview');
	let images: any = $state([]);

	export async function getImages(dir: string) {
		let response = await fetch(`/api/images?dir=${dir}`, {
			method: 'GET'
		});
		images = await response.json();
		images = images;
	}
</script>

<div class="flex-row">
	{#if viewMode === 'overview' || viewMode === 'journey'}
		<div
			id="mapContainer"
			class="h-screen w-screen flex-1 overflow-hidden"
			bind:this={mapContainer}
		>
			<Map bind:map={map!} bind:mapContainer bind:data bind:currentJourneyData bind:viewMode />
		</div>
	{/if}

	{#if viewMode === 'journey'}
		{console.log($state.snapshot(currentJourneyData))}
	{/if}
</div>

<script lang="ts">
	import CreateJourneyModal from '$lib/components/CreateJourneyModal.svelte';
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
	let modalContent: any = $state();
	let modal = $state();

	export async function getImages(dir: string) {
		let response = await fetch(`/api/images?dir=${dir}`, {
			method: 'GET'
		});
		images = await response.json();
		images = images;
	}
</script>

<div class="flex h-screen w-screen flex-row">
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
		<div
			id="book"
			class="flex-[1.5] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 overflow-auto p-4"
		>
			<button
class="col-span-full rounded-md p-3 text-5xl font-semibold text-white {currentJourneyData?.color} text-center"
				onclick={() => (viewMode = 'overview')}
>
				{currentJourneyData?.name}
			</button>
			{#await currentJourneyData then currentJourneyData}
{#if currentJourneyData?.image}
					{#if currentJourneyData.image.length > 0}
				{#each currentJourneyData?.image as { journeyId, lng, lat, path, fileName, width, height }}
					<img
						src={path}
						alt={fileName}
						class="h-full w-full cursor-pointer rounded-lg object-cover hover:scale-105"
					/>
				{/each}
{:else}
						<div class="h-full w-full cursor-pointer rounded-lg object-cover hover:scale-105">
							No images yet
						</div>
					{/if}
				{/if}
			{/await}
		</div>
	{/if}
</div>

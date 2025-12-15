<script lang="ts">
	import CreateJourneyModal from '$lib/components/CreateJourneyModal.svelte';
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';

	let { data }: PageProps = $props();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let book = $state<HTMLDivElement>();
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

{#if global.viewMode === 'journey'}
	<div></div>
{/if}
<div class="flex h-screen w-screen flex-row">
	{#if global.viewMode === 'overview' || global.viewMode === 'journey'}
		<div
			id="mapContainer"
			class="h-screen w-screen flex-1 overflow-hidden"
			bind:this={mapContainer}
		>
			<Map bind:map={map!} bind:mapContainer bind:data />
		</div>
	{/if}

	{#if global.viewMode === 'journey'}
		<div
			id="book"
			class="grid flex-[1.5] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 overflow-auto p-4"
		>
			<button
				class="col-span-full rounded-md p-3 text-5xl font-semibold text-white text-left"
				onclick={() => (global.viewMode = 'overview')}
			>
				Pictures
			</button>
			{#if global.journeyData?.image}
				{#if global.journeyData.image.length > 0}
					{#each global.journeyData?.image as { journeyId, lng, lat, path, fileName, width, height }}
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
		</div>
	{/if}
</div>

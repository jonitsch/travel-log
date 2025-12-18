<script lang="ts">
	import CreateJourneyModal from '$lib/components/CreateJourneyModal.svelte';
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global, type ViewMode } from '$lib/state.svelte';

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

<div class="h flex h-full max-h-full w-full flex-row gap-4 overflow-hidden">
	<div class="items-top flex flex-1 flex-col gap-4">
		<div id="header" class="{global.viewMode === 'journey' ? 'h-fit' : 'hidden'} ">
			<text class="text-4xl text-white">{global.journeyData?.name ?? 'Hello World'}</text>
		</div>
		<div id="mapContainer" class="h-full flex-1" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:data />
		</div>
		<div id="header" class="{global.viewMode === 'journey' ? 'flex-[1.5]' : 'hidden'} ">
			<text class="text-2xl text-white">Info</text>
		</div>
	</div>

	{#if global.viewMode === 'journey'}
		<div class="items-top flex flex-[3] flex-col gap-4">
			<div id="header" class="{global.viewMode === 'journey' ? 'h-fit' : 'hidden'} ">
				<text class="text-4xl text-white invisible">.</text>
			</div>
			<div
				id="book"
				class="grid flex-[3] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 overflow-auto"
				bind:this={book}
			>
				{#if global.journeyData?.image}
					{#if global.journeyData.image.length > 0}
						{#each global.journeyData?.image as img}
							<img
								src={img.path}
								alt={img.fileName}
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
		</div>
	{/if}
</div>

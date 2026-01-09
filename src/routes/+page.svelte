<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';

	let { data }: PageProps = $props();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let book = $state<HTMLDivElement>();

	export async function getImages(journeyId: string): Promise<any> {
		let response = await fetch(`/api/images?dir=${journeyId}`, {
			method: 'GET'
		});
		let images = await response.json();
		return images;
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
		<div id="header" class="{global.viewMode === 'journey' ? 'flex-[0]' : 'hidden'} ">
			<text class="text-2xl text-white">Info</text>
		</div>
	</div>

	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		<div class="items-top flex flex-[1] flex-col gap-4">
			<div id="header" class="{global.viewMode === 'journey' ? 'h-fit' : 'hidden'} ">
				<text class="invisible text-4xl text-white">.</text>
			</div>
			<div
				id="book"
				class="grid flex-[3] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] overflow-x-hidden"
				bind:this={book}
			>
				{#if journey?.image}
					{#if journey.image.length > 0}
						{#each journey.image as img}
							{#await getImgProxyURL(img.path, img.width * 0.3, img.height * 0.3)}
								<div
									class="h-full w-full cursor-pointer rounded-lg bg-slate-600 hover:scale-105"
								></div>
							{:then response}
								<img
									id={`bookpic-${img.id}`}
									src={response}
									alt={img.fileName}
									class="cursor-pointer rounded-lg hover:scale-105 transition duration-100 ease-in-out"
								/>
							{/await}
						{/each}
					{:else}
						<div class="h-full w-full cursor-pointer rounded-lg hover:scale-105">
							No images yet
						</div>
					{/if}
				{:else}
					{@const error = new Error('Images failed to load - no image data received')}
					<ErrorMessage {error}>Failed To Load Image Data</ErrorMessage>
				{/if}
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';
	import { slide } from 'svelte/transition';
	import type { Journey } from '$src/lib/server/prisma';

	let { data }: PageProps = $props();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let book = $state<HTMLDivElement>();
	let timeRange = (journey: Journey) => {
		let end = new Date(journey.image[journey.image.length - 1].createdOn);
		let start = new Date(journey.image[0].createdOn);
		return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
	};

	export async function getImages(journeyId: string): Promise<any> {
		let response = await fetch(`/api/images?dir=${journeyId}`, {
			method: 'GET'
		});
		let images = await response.json();
		return images;
	}
</script>

<div class="h flex h-full max-h-full w-full flex-row gap-4 overflow-hidden">
	<div
		class="items-top flex {global.viewMode === 'journey' ? 'flex-[0.7]' : 'flex-1'} flex-col gap-4"
	>
		<!------------------- MAP CONTAINER --------------------->
		<div id="mapContainer" class="h-full flex-1" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:data />
		</div>

		<!---------------------------------------------------- JOURNEY MODE ---------------------------------------------------->
		{#if global.viewMode === 'journey'}
			{@const journey = global.journeyData}
			{#if journey}
				<div
					id="header"
					class={[
						'h-fit w-fit',
						{ 'animate-pulse rounded-lg bg-slate-600 [&>*]:invisible': global.loadingJourney }
					]}
				>
					<text class="text-4xl text-white">
						{global.journeyData?.name ?? 'Loading Name'}
					</text>
				</div>
				<!------------------- JOURNEY HEADER --------------------->
				<div
					id="header"
					class={[
						'h-fit flex-none flex-col text-white',
						{ 'animate-pulse rounded-lg bg-slate-600 [&>*]:invisible': global.loadingJourney }
					]}
				>
					<!------------------- INFO BOX --------------------->
					<text class="flex text-2xl">Info</text>
					<text class="text-1xl flex text-{journey.color}">{timeRange(journey)}</text>
				</div>
			{/if}
		{/if}
	</div>

	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		<div class="items-top flex flex-[1] flex-col gap-4">
			<!-- 				<div id="header" class="{global.viewMode === 'journey' ? 'h-fit' : 'hidden'} ">
					<text class="invisible text-4xl text-white">.</text>
				</div> -->
			<div
				id="book"
				class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 overflow-x-hidden"
				bind:this={book}
			>
				{#if global.loadingJourney}
					{#each { length: journey?.image.length ?? 200 }}
						<div
							id="skeletonImage"
							class="animate-pulse rounded-lg bg-slate-600"
							style="width: 1fr; height: 300px;"
						></div>
					{/each}
				{:else if journey?.image}
					{#if journey.image.length > 0}
						{#each journey.image as img}
							{#await getImgProxyURL(img.path, img.width * 0.22, img.height * 0.22) then response}
								<img
									id="bookpic-{img.id}"
									src={response}
									alt={img.fileName}
									class="h-full w-full cursor-pointer rounded-lg object-cover text-white transition duration-100 ease-in-out hover:scale-105"
									loading="lazy"
								/>
							{/await}
						{/each}
					{:else}
						<div
							class="h-full w-full cursor-pointer rounded-lg text-2xl text-white hover:scale-105"
						>
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

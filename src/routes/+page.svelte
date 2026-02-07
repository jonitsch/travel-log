<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';
	import FullImageModal from '$src/lib/components/FullImageModal.svelte';
	import CreateJourneyModal from '$src/lib/components/CreateJourneyModal.svelte';
	import ImageCard from '$src/lib/components/ImageCard.svelte';
	import { formattedDate, timeRange } from '$src/lib/utils';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();
	let createJourneyModal = $state<CreateJourneyModal>();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let fullImageModal = $state<FullImageModal>();
	let book = $state<HTMLDivElement>();
	// svelte-ignore non_reactive_update
	let previousDate: string | null = null;
	let dayOf = (date: Date) => {
		return date.toISOString().slice(0, 10);
	}; // DD//MM//YYYY

	export async function getImages(journeyId: string): Promise<any> {
		let response = await fetch(`/api/images?dir=${journeyId}`, {
			method: 'GET'
		});
		let images = await response.json();
		return images;
	}
</script>

<div class="flex size-full flex-row gap-4 overflow-hidden">
	<div
		class="items-top flex flex-col gap-4 {global.viewMode === 'overview'
			? 'size-full'
			: 'h-full w-[40dvw]'}"
	>
		<!------------------- MAP CONTAINER --------------------->
		<div id="mapContainer" class="size-full" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:data bind:createJourneyModal />
		</div>

		<!------------------- JOURNEY HEADER --------------------->
		{#if global.viewMode === 'journey'}
			{@const journey = global.journeyData}
			{#if journey}
				<div class="animate-slide-left flex flex-col gap-1">
					<div
						id="header"
						class={[
							'flex h-fit w-full flex-row items-stretch gap-5',
							{ 'skeleton *:invisible': global.loadingJourney }
						]}
					>
						<text class="oxygen-bold text-5xl text-white">
							{journey.name ?? 'Loading Name'}
						</text>
						<!-- 						<form method="POST" action="?/deleteJourney" class="mr-0">
							<button
								class="oxygen-bold text-1xl w-fit rounded-md p-3 leading-tight text-gray-50 shadow-xl bg-gray-900"
								aria-label="Delete Journey"
								name="journeyId"
								value={journey.journeyId}
								type="submit">Delete</button
							>
						</form> -->
					</div>
					<!-------------------    INFO BOX     --------------------->
					<div
						class={[
							'h-fit w-fit flex-none flex-col text-white',
							{ 'skeleton *:invisible': global.loadingJourney }
						]}
					>
						<text class="flex text-2xl">
							{timeRange(journey)}
						</text>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		<div
			id="book"
			class="animate-slide-right grid h-full w-[75dvw] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 overflow-x-hidden overflow-y-visible pr-3"
			bind:this={book}
		>
			{#if global.loadingJourney}
				<div class="col-span-full skeleton py-2 text-2xl text-transparent">Placeholder</div>
				{#each { length: 200 }}
					<div id="skeletonImage" class="skeleton" style="width: 1fr; height: 300px;"></div>
				{/each}
			{:else if journey}
				{@const images = journey.image}
				{(previousDate = null)}
				{#if images.length > 0}
					{#each images as img}
						{@const date = new Date(img.createdOn)}
						{#if previousDate != dayOf(date)}
							<div
								class={[
									'col-span-full w-full rounded-md px-4 py-2 text-2xl text-white shadow-inner shadow-slate-400/60',
									{ 'mt-4': previousDate }
								]}
							>
								{formattedDate(date, 'dd/mm/yyyy')}
							</div>
						{/if}
						<div class="col-span-1">
							{#await getImgProxyURL(img.path, img.width * 0.15, img.height * 0.15) then response}
								<ImageCard {img} src={response} {fullImageModal} />
							{:catch error}
								<ErrorMessage {error}>Image Failed To Load!</ErrorMessage>
							{/await}
						</div>
						<div hidden>{(previousDate = dayOf(date))}</div>
					{/each}
				{:else}
					<div class="h-full w-full text-2xl text-white">No images yet</div>
				{/if}
			{:else}
				{@const error = new Error('Images failed to load - no image data received')}
				<ErrorMessage {error}>Failed To Load Image Data</ErrorMessage>
			{/if}
			<FullImageModal bind:this={fullImageModal} />
		</div>
	{/if}
	<!------------------- CREATE JOURNEY MODAL --------------------->
	<CreateJourneyModal bind:this={createJourneyModal} />
</div>

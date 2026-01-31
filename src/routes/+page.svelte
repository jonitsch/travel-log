<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';
	import type { Journey } from '$src/lib/server/prisma';
	import FullImageModal from '$src/lib/components/FullImageModal.svelte';
	import CreateJourneyModal from '$src/lib/components/CreateJourneyModal.svelte';
	import ImageCard from '$src/lib/components/ImageCard.svelte';

	let { data }: PageProps = $props();
	let createJourneyModal = $state<CreateJourneyModal>();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let fullImageModal = $state<FullImageModal>();
	let book = $state<HTMLDivElement>();
	let previousDate = $state<string>();

	let timeRange = (journey: Journey) => {
		if (journey.image.length === 0) return;
		let end = new Date(journey.image[journey.image.length - 1].createdOn);
		let start = new Date(journey.image[0].createdOn);
		return `${start.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})} - ${end.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})}`;
	};
	const formattedDate = (imgDate: Date) => {
		let date = new Date(imgDate);
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour12: false
		});
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
				<div class="animate-slide-left flex flex-col gap-0">
					<div
						id="header"
						class={[
							'flex h-fit w-full flex-row items-stretch gap-5',
							{ 'animate-pulse rounded-lg bg-slate-600 [&>*]:invisible': global.loadingJourney }
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
							{ 'animate-pulse rounded-lg bg-slate-600 [&>*]:invisible': global.loadingJourney }
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
			class="grid h-full w-[60dvw] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 overflow-x-hidden overflow-y-visible"
			bind:this={book}
		>
			{#if journey}
				{@const uniqueDates = [
					...new Set(
						journey.image.map((img) => {
							const date = new Date(img.createdOn);
							return date.toISOString().slice(0, 10); // DD//MM//YYYY
						})
					)
				]}
				{#each uniqueDates as date}
					<!-- Filter images by uniqueDate -->
					{@const images = journey.image.filter((img) => {
						let currDate = new Date(img.createdOn);
						return currDate.toISOString().slice(0, 10) === date;
					})}
					<div
						class="w-fit text-3xl text-white bg-{journey.color} col-span-full rounded-md px-2 py-1"
					>
						{formattedDate(new Date(date))}
					</div>
					{#if global.loadingJourney}
						{#each { length: journey?.image.length ?? 200 }}
							<div
								id="skeletonImage"
								class="animate-pulse rounded-md bg-slate-600"
								style="width: 1fr; height: 300px;"
							></div>
						{/each}
					{:else if images.length > 0}
						{#each images as img}
							{#await getImgProxyURL(img.path, img.width * 0.22, img.height * 0.22) then response}
								<div class="col-span-1">
									<ImageCard {img} src={response} {fullImageModal} />
								</div>
							{/await}
						{/each}
					{:else}
						<div class="h-full w-full text-2xl text-white">No images yet</div>
					{/if}
				{/each}
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

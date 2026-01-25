<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';
	import type { Journey } from '$src/lib/server/prisma';
	import FullImageModal from '$src/lib/components/FullImageModal.svelte';
	import { awaitImageRender } from '$src/lib/utils';
	import CreateJourneyModal from '$src/lib/components/CreateJourneyModal.svelte';

	let { data }: PageProps = $props();
	let createJourneyModal = $state<CreateJourneyModal>();
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let fullImageModal = $state<FullImageModal>();
	let book = $state<HTMLDivElement>();
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
		<div id="mapContainer" class="flex-1" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:data bind:createJourneyModal />
		</div>

		<!---------------------------------------------------- JOURNEY MODE ---------------------------------------------------->
		{#if global.viewMode === 'journey'}
			{@const journey = global.journeyData}
			{#if journey}
				<div class={`flex flex-col ${!global.loadingJourney ? 'gap-0' : 'gap-3'}`}>
					<!------------------- JOURNEY HEADER --------------------->
					<div
						id="header"
						class={[
							'flex h-fit w-full flex-row gap-5 items-stretch',
							{ 'animate-pulse rounded-lg bg-slate-600 [&>*]:invisible': global.loadingJourney }
						]}
					>
						<text class="oxygen-bold text-5xl text-white">
							{global.journeyData?.name ?? 'Loading Name'}
						</text>
						<form method="POST" action="?/deleteJourney" class="mr-0">
							<button
								class="oxygen-bold text-1xl w-fit rounded-md p-3 leading-tight text-gray-50 shadow-xl bg-gray-900"
								aria-label="Delete Journey"
								name="journeyId"
								value={journey.journeyId}
								type="submit">Delete</button
							>
						</form>
					</div>
					<!-------------------    INFO BOX     --------------------->
					<div
						class={[
							'h-fit w-fit flex-none flex-col text-white',
							{ 'animate-pulse rounded-lg bg-slate-600 [&>*]:invisible': global.loadingJourney }
						]}
					>
						<text class="flex text-2xl text-{journey.color}">
							{timeRange(journey)}
						</text>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		<div class="items-top flex flex-[1] flex-col gap-4">
			<div
				id="book"
				class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 overflow-x-hidden"
				bind:this={book}
			>
				{#if global.loadingJourney}
					{#each { length: journey?.image.length ?? 200 }}
						<div
							id="skeletonImage"
							class="animate-pulse rounded-md bg-slate-600"
							style="width: 1fr; height: 300px;"
						></div>
					{/each}
				{:else if journey?.image}
					{#if journey.image.length > 0}
						{#each journey.image as img}
							{#await getImgProxyURL(img.path, img.width * 0.22, img.height * 0.22) then response}
								<button
									type="button"
									onclick={() => fullImageModal?.open(img)}
									class="relative block"
								>
									<div
										id="skeletonImage-{img.id}"
										class="absolute inset-0 rounded-md bg-slate-600"
									></div>
									<img
										id="bookpic-{img.id}"
										src={response}
										alt={img.fileName}
										class="h-full w-full cursor-pointer rounded-md object-cover text-white
												transition duration-100 ease-in-out hover:scale-105"
										loading="lazy"
										onload={(e) =>
											awaitImageRender(() => {
												document.getElementById(`skeletonImage-${img.id}`)?.remove();
											})}
									/>
								</button>
							{/await}
						{/each}
					{:else}
						<div class="h-full w-full text-2xl text-white">No images yet</div>
					{/if}
				{:else}
					{@const error = new Error('Images failed to load - no image data received')}
					<ErrorMessage {error}>Failed To Load Image Data</ErrorMessage>
				{/if}
			</div>
			<FullImageModal bind:this={fullImageModal} />
		</div>
	{/if}
	<!------------------- CREATE JOURNEY MODAL --------------------->
	<CreateJourneyModal bind:this={createJourneyModal} />
</div>

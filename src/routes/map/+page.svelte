<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';
	import FullImageModal from '$src/lib/components/FullImageModal.svelte';
	import ImageCard from '$src/lib/components/ImageCard.svelte';
	import { formattedDate, timeRange } from '$src/lib/utils';
	import type { Journey } from '$gen/prisma/client/client';
	import SVGIcon from '$src/lib/components/SVGIcon.svelte';

	let { data }: PageProps = $props();
	let journeys = $state<Journey[]>(data.journeys);
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();
	let fullImageModal = $state<FullImageModal>();
	let book = $state<HTMLDivElement>();
	// svelte-ignore non_reactive_update
	let previousDate: string | null = null;
	let dayOf = (date: Date) => {
		return date.toISOString().slice(0, 10);
	}; // DD//MM//YYYY
</script>

<div class="flex size-full flex-row gap-4 overflow-hidden">
	<div
		class="items-top flex flex-col gap-4 {!(global.viewMode === 'journey')
			? 'size-full'
			: 'h-full w-[40dvw]'}"
	>
		<!------------------- MAP CONTAINER --------------------->
		<div id="mapContainer" class="size-full" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:journeys />
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
		<div class="animate-slide-right flex h-full w-[75dvw] flex-col overflow-y-auto">
			<div class="min-h-0 flex-1">
				<div
					id="book"
					class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 overflow-x-hidden pr-3"
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
											'col-span-full h-fit w-full rounded-md border-b-2 border-black/60 bg-gray-900/70 px-4 py-2',
											{ 'mt-4': previousDate }
										]}
									>
										<div class="text-2xl text-white">{formattedDate(date, 'dd/mm/yyyy')}</div>
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
							<div
								class="col-span-full h-fit w-full rounded-md border-b-2 border-black/60 bg-gray-900/70 px-4 py-2 text-2xl text-white"
							>
								No images yet!
							</div>
							<div
								id="addImagePlaceholder"
								class="flex items-center justify-center rounded-md bg-slate-800 col-span-full"
								style="width: 1fr; height: 300px;"
							>
								<SVGIcon type="addImage" fill="white" scale={2.5} />
							</div>
						{/if}
					{:else}
						{@const error = new Error('Images failed to load - no image data received')}
						<ErrorMessage {error}>Failed To Load Image Data</ErrorMessage>
					{/if}
					<FullImageModal bind:this={fullImageModal} />
				</div>
			</div>
		</div>
	{/if}
</div>

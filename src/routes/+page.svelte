<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$src/lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$src/lib/imgproxy';
	import type { Journey } from '$src/lib/server/prisma';
	import FullImageModal from '$src/lib/components/FullImageModal.svelte';
	import { awaitImageRender, getBBox } from '$src/lib/utils';
	import CreateJourneyModal from '$src/lib/components/CreateJourneyModal.svelte';
	import SVGIcon from '$src/lib/components/SVGIcon.svelte';

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
	let selectedId = $state<string>();

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
		<div class="animate-slide-right items-top flex w-[60dvw] flex-col gap-4">
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
								<div id="imageCard-{img.id}" class="relative block">
									<div
										id="skeletonImage-{img.id}"
										class="absolute inset-0 rounded-md bg-slate-600"
									></div>
									<div
										id="imageControlOverlay"
										class="group absolute inset-0 flex items-end rounded-md bg-transparent hover:bg-slate-900/30"
									>
										<div
											class="invisible flex h-fit w-full flex-row flex-wrap justify-evenly bg-slate-900/80 py-2 group-hover:visible"
										>
											<button
												id="viewFullImageButton-{img.id}"
												title="View Full Image"
												onclick={() => fullImageModal?.open(img)}
											>
												<SVGIcon type="fullscreen" />
											</button>
											{#if img.lng && img.lat}
												<button
													id="showOnMapButton-{img.id}"
													title="Show Image on Map"
													onclick={() => {
														if (!global.map || !img.lng || !img.lat) return;
														map = global.map;
														if (
															selectedId === img.id &&
															map.getCenter().lng.toFixed(4) === img.lng.toFixed(4) &&
															map.getZoom() === 13
														) {
															const bbox = getBBox(journey);
															if (!bbox) return;
															map.fitBounds(bbox, {
																padding: {
																	top: 90,
																	bottom: 90,
																	left: 90,
																	right: 90
																},
																duration: 1500
															});
															selectedId = undefined;
														} else {
															map.flyTo({ center: [img.lng, img.lat], zoom: 13, speed: 2 });
															selectedId = img.id;
														}
													}}
												>
													<SVGIcon
														type="marker"
														stroke={selectedId === img.id ? 'lightgreen' : 'white'}
													/>
												</button>
											{:else}
												<button title="Image has no Coordinate Data" disabled>
													<SVGIcon type="marker" disabled />
												</button>
											{/if}
										</div>
									</div>
									<img
										id="bookpic-{img.id}"
										src={response}
										alt={img.fileName}
										class="h-full w-full cursor-pointer rounded-md object-cover text-white
												transition duration-100 ease-in-out hover:scale-105"
										loading="lazy"
										onload={() =>
											awaitImageRender(() => {
												document.getElementById(`skeletonImage-${img.id}`)?.remove();
											})}
									/>
								</div>
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

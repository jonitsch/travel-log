<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$lib/imgproxy';
	import FullImageModal from '$lib/components/modal/FullImageModal.svelte';
	import ImageCard from '$lib/components/ImageCard.svelte';
	import { formattedDate, timeRange } from '$lib/utils/client';
	import type { Journey } from '$gen/prisma/client/client';
	import SVGIcon from '$lib/components/SVGIcon.svelte';
	import Input from '$lib/components/shadcn/input/input.svelte';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import { Button } from '$lib/components/shadcn/button';

	let { data }: PageProps = $props();
	let journeys = $state<Journey[]>(data.journeys);
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();

	let fullImageModal = $state<FullImageModal>(),
		addImageModal = $state<AddImageModal>();

	let book = $state<HTMLDivElement>();
	// svelte-ignore non_reactive_update
	let previousDate: string | null = null;
	let dayOf = (date: Date) => {
		return date.toISOString().slice(0, 10);
	}; // DD//MM//YYYY
	let imgInputFiles = $state<FileList>();
</script>

<div
	class="grid size-full {global.viewMode === 'journey'
		? 'grid-cols-[35%_1fr] grid-rows-[auto_1fr]'
		: ''} gap-4 overflow-hidden"
>
	<!------------------- MAP HEADER --------------------->
	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		{#if journey}
			<div class="animate-slide-left flex h-fit flex-col justify-between">
				<div
					id="header"
					class="h-fit items-stretch gap-5 {global.loadingJourney
						? 'skeleton *:invisible'
						: ''}"
				>
					<div class="oxygen-bold text-5xl text-white truncate py-1">
						{journey.name ?? 'Loading Name'}
					</div>
				</div>
				<!-------------------    INFO BOX     --------------------->
				<div
					class={[
						'h-fit w-fit flex-none flex-col text-white',
						{ 'skeleton *:invisible': global.loadingJourney }
					]}
				>
					<text class="flex text-2xl font-light">
						{timeRange(journey)}
					</text>
				</div>
			</div>
			<!------------------- BOOK HEADER --------------------->
			<div class="animate-slide-left flex h-fit flex-col items-start gap-1">
				<div
					id="header"
					class={[
						'flex h-fit flex-row items-stretch gap-5',
						{ 'skeleton *:invisible': global.loadingJourney }
					]}
				>
					<div class="inline-flex items-end gap-2 oxygen-bold text-5xl text-white py-1">
						Images <div class="font-light text-3xl">{`(${journey.image.length})`}</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
	<div class="items-top flex size-full flex-col gap-4">
		<!------------------- MAP CONTAINER --------------------->
		<div id="mapContainer" class="size-full" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:journeys />
		</div>
	</div>
	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		<div class="animate-slide-right flex h-full w-full flex-2 flex-col gap-4 overflow-y-auto">
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
						<form
							id="addImageForm"
							action="?/addImage"
							method="POST"
							enctype="multipart/form-data"
							class="col-span-full flex h-75 flex-col items-center justify-center gap-5 rounded-md bg-slate-800 text-2xl"
						>
							<div class="flex flex-row items-center gap-1">
								Add your first images!
								<SVGIcon type="addImage" fill="white" scale={1.5} hoverScale={false} />
							</div>
							<div class="flex flex-row gap-2">
								<Input
									name="files"
									type="file"
									class="w-sm cursor-pointer hover:ring-2 hover:ring-white"
									bind:files={imgInputFiles}
									accept="image/*"
									multiple
								/>
								<Button type="submit" class="bg-green-600" disabled={!imgInputFiles?.length}
									>Upload</Button
								>
							</div>
							<input type="hidden" value={journey.journeyId} name="journeyId" />
						</form>
					{/if}
				{:else}
					{@const error = new Error('Images failed to load - no image data received')}
					<ErrorMessage {error}>Failed To Load Image Data</ErrorMessage>
				{/if}
				<FullImageModal bind:this={fullImageModal} />
				<AddImageModal bind:this={addImageModal} />
			</div>
		</div>
	{/if}
</div>

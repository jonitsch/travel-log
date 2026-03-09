<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import { timeRange } from '$lib/utils/client';
	import type { Journey } from '$gen/prisma/client/client';
	import SVGIcon, { type iconType } from '$lib/components/SVGIcon.svelte';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import Book from '$lib/components/Book.svelte';

	let { data }: PageProps = $props();
	let journeys = $state<Journey[]>(data.journeys);
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();

	let addImageModal = $state<AddImageModal>();
	let currentSelection = $state<string[]>([]);
</script>

{#snippet imageControl(type: iconType, text: string, onclick: () => any)}
	<button
		class={[
			'flex w-fit flex-row items-center gap-1 rounded-md p-1',
			{ 'hover:bg-gray-900': !global.loadingJourney },
			{ 'bg-gray-900': global.imgSelectMode && type === 'selectImages' }
		]}
		{onclick}
	>
		<SVGIcon {type} fill={global.loadingJourney ? 'none' : 'white'} hoverScale={false} />
		{text}
	</button>
{/snippet}

<div
	class="grid size-full {global.viewMode === 'journey'
		? 'grid-cols-[35%_1fr] grid-rows-[auto_1fr]'
		: ''} gap-4 overflow-hidden"
>
	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		{#if journey}
			<!------------------- MAP HEADER --------------------->
			<div
				class="animate-slide-left flex h-fit flex-col justify-between {global.loadingJourney
					? 'gap-2 *:skeleton *:text-transparent'
					: '*:text-white'}"
			>
				<div class="oxygen-bold truncate py-2 text-5xl">
					{journey.name ?? 'Loading Name'}
				</div>
				<div class="w-fit text-2xl font-light">
					{timeRange(journey)}
				</div>
			</div>
			<!------------------- BOOK HEADER --------------------->
			<div
				class="animate-slide-left flex h-fit flex-col justify-between gap-2 {global.loadingJourney
					? '*:skeleton *:text-transparent'
					: '*:text-white'}"
			>
				<div class="flex w-fit flex-row items-end gap-2 py-2">
					<div class="oxygen-bold flex flex-row items-end gap-2 text-5xl">
						Images <div class="text-3xl font-light">{`(${journey.image.length})`}</div>
					</div>
					<div class="flex w-fit flex-row items-center gap-3">
						{@render imageControl('selectImages', 'Select Images', () => {
							global.imgSelectMode = !global.imgSelectMode;
							if (!global.imgSelectMode) {
								currentSelection = global.selectedImageIds;
								global.selectedImageIds = [];
							} else {
								global.selectedImageIds = currentSelection;
							}
						})}
						{@render imageControl('addImage', 'Add Images', () => addImageModal?.openModal())}
					</div>
				</div>
				{#if !global.imgSelectMode}
					<div class="flex w-fit flex-row gap-2 *:items-center">
						<button
							class={[
								'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto disabled:opacity-50',
								{ '*:invisible': global.loadingJourney }
							]}
							disabled={global.selectedImageIds.length != 1}
						>
							<SVGIcon
								type="delete"
								scale={0.8}
								stroke="white"
							/>Delete</button
						>
						<button
							class={[
								'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto disabled:opacity-50',
								{ '*:invisible': global.loadingJourney }
							]}
							disabled={global.selectedImageIds.length != 1}
						>
							<SVGIcon
								type="rename"
								fill={global.loadingJourney ? '' : 'white'}
								scale={0.9}
							/>Rename</button
						>
					</div>
				{:else}
					<div class="flex w-fit flex-row gap-2">
						Selected:
						<div class="w-[3ch]">{global.selectedImageIds.length}</div>
						<button
							class="hover:underline"
							aria-label="Unselect All"
							onclick={() => (global.selectedImageIds = [])}>Unselect all</button
						>
						<button
							class="hover:underline"
							aria-label="Select All"
							onclick={() => (global.selectedImageIds = journey.image.map((img) => img.id))}
							>Select all</button
						>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
	<div class="items-top flex size-full flex-col gap-4">
		<div id="mapContainer" class="size-full" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:journeys />
		</div>
	</div>
	{#if global.viewMode === 'journey'}
		{@const journey = global.journeyData}
		<div id="bookContainer" class="animate-slide-right size-full overflow-y-auto">
			<Book />
		</div>
	{/if}
</div>

<AddImageModal bind:this={addImageModal} />

<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import { imgHighlightColor, timeRange } from '$lib/utils/client';
	import type { Journey } from '$gen/prisma/client/client';
	import SVGIcon, { type iconType } from '$lib/components/SVGIcon.svelte';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import Book from '$lib/components/Book.svelte';
	import DeleteImageModal from '$lib/components/modal/DeleteImageModal.svelte';
	import RenameImageModal from '$lib/components/modal/RenameImageModal.svelte';

	let { data }: PageProps = $props();
	let journeys = $state<Journey[]>(data.journeys);
	let mapContainer = $state<HTMLDivElement>();
	let map = $state<maplibregl.Map>();

	let addImageModal = $state<AddImageModal>(),
		deleteImageModal = $state<DeleteImageModal>(),
		renameImageModal = $state<RenameImageModal>();

	let currentSelection = $state<string[]>([]),
		allImagesSelected = $derived(
			global.selectedImageIds.length === global.journeyData?.image.length
		);

	function handleSelectAll() {
		if (!allImagesSelected && global.journeyData) {
			currentSelection = global.selectedImageIds;
			global.selectedImageIds = global.journeyData.image.map((img) => img.id);
		} else {
			global.selectedImageIds = currentSelection;
		}
	}
</script>

{#snippet imageControl(type: iconType, text: string, onclick: () => any)}
	<button
		class={[
			'flex w-fit flex-row items-center gap-1 rounded-md p-1',
			{ 'hover:bg-gray-900': !global.loadingJourney },
			{ 'bg-gray-900': global.imgSelectMode && type === 'selectImages' && !global.loadingJourney }
		]}
		{onclick}
	>
		<SVGIcon {type} color={global.loadingJourney ? 'none' : 'white'} hoverScale={false} />
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
		<!------------------- MAP HEADER --------------------->
		<div
			class="animate-slide-left flex h-fit flex-col justify-between {global.loadingJourney
				? 'gap-2 *:skeleton *:text-transparent'
				: '*:text-white'}"
		>
			<div class="oxygen-bold truncate py-2 text-5xl">
				{journey?.name ?? 'Loading Journey...'}
			</div>
			<div class="w-fit text-2xl font-light">
				{timeRange(journey) ?? ''}
			</div>
		</div>
		<!------------------- BOOK HEADER --------------------->
		<div
			class="animate-slide-left flex h-fit flex-col justify-between gap-2 {global.loadingJourney
				? '*:skeleton *:text-transparent'
				: '*:text-white'}"
		>
			<div class="flex w-full flex-row items-end gap-2 py-2">
				<div class="oxygen-bold flex flex-row items-end gap-2 text-5xl">
					Images <div class="text-3xl font-light">{`(${journey?.image.length ?? 0})`}</div>
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

			<div
				class="flex {global.loadingJourney
					? 'w-fit'
					: 'w-full'} flex-row justify-between *:flex *:items-end *:gap-2"
			>
				<div class="*:items-center">
					<button
						class={[
							'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto! disabled:opacity-50',
							{ '*:invisible': global.loadingJourney }
						]}
						disabled={global.selectedImageIds.length === 0}
						onclick={() => deleteImageModal?.openModal()}
					>
						<SVGIcon type="delete" scale={0.8} color="white" />Delete</button
					>
					<button
						class={[
							'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto! disabled:opacity-50',
							{ '*:invisible': global.loadingJourney }
						]}
						disabled={!(global.selectedImageIds.length === 1)}
						onclick={() => {
							if (!(global.selectedImageIds.length === 1)) return;
							const img = journey?.image.find((i) => i.id === global.selectedImageIds[0]);
							if (img) renameImageModal?.openModal(img);
						}}
					>
						<SVGIcon class="pt-0.75" type="rename" color="white" scale={0.85} />Rename</button
					>
				</div>
				{#if global.imgSelectMode}
					<div>
						<button
							class={[
								'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto! disabled:opacity-50',
								{ '*:invisible': global.loadingJourney }
							]}
							aria-label="Select All"
							onclick={() => handleSelectAll()}
							><SVGIcon
								class="pt-0.75"
								type="selectAll"
								color={allImagesSelected ? imgHighlightColor : 'white'}
								scale={0.85}
							/>Select all</button
						>
						<button
							class={[
								'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto! disabled:opacity-50',
								{ '*:invisible': global.loadingJourney }
							]}
							aria-label="Unselect All"
							onclick={() => (global.selectedImageIds = [])}
							><SVGIcon class="pt-0.75" type="unselectAll" color="white" scale={0.85} />Unselect all</button
						>
						Selected:
						<div class="w-[3ch]">{global.selectedImageIds.length}</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	<div class="items-top flex size-full flex-col gap-4">
		<div id="mapContainer" class="size-full" bind:this={mapContainer}>
			<Map bind:map={map!} bind:mapContainer bind:journeys />
		</div>
	</div>
	{#if global.viewMode === 'journey'}
		<div id="bookContainer" class="animate-slide-right size-full overflow-y-auto">
			{#if global.journeyData?.image.length}
				<Book />
			{:else}
				<div
					class="flex size-full flex-row items-center justify-center gap-3 rounded-md text-3xl {global.loadingJourney
						? 'skeleton'
						: 'bg-gray-900'}"
				>
					Add your first images!
					<SVGIcon type="addImage" color="white" scale={2} hoverScale={false} />
				</div>
			{/if}
		</div>
	{/if}
</div>

<AddImageModal bind:this={addImageModal} addImageForm={data.addImageForm} />
<DeleteImageModal bind:this={deleteImageModal} deleteImageForm={data.deleteImageForm} />
<RenameImageModal bind:this={renameImageModal} renameImageForm={data.renameImageForm} />

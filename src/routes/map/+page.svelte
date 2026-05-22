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

	let { deleteImageForm, addImageForm, renameImageForm } = $derived(data);

	let journeys = $derived<Journey[]>(data.journeys);
	let mapContainer = $state<HTMLDivElement>();

	let addImageModal = $state<AddImageModal>(),
		deleteImageModal = $state<DeleteImageModal>(),
		renameImageModal = $state<RenameImageModal>();

	let cachedSelection = $state<string[]>([]),
		allImagesSelected = $derived(
			global.selectedImageIds.length === global.journeyData?.image.length &&
				global.selectedImageIds.length > 0
		);

	function handleSelectMode() {
		global.imgSelectMode = !global.imgSelectMode;
		if (!global.imgSelectMode) {
			cachedSelection = global.selectedImageIds;
			global.selectedImageIds = [];
		} else {
			global.selectedImageIds = cachedSelection;
		}
	}

	function handleSelectAll() {
		if (!allImagesSelected && global.journeyData) {
			cachedSelection = global.selectedImageIds;
			global.selectedImageIds = global.journeyData.image.map((img) => img.id);
		} else {
			global.selectedImageIds = cachedSelection;
		}
	}

	function handleUnselectAll() {
		if (global.selectedImageIds.length) {
			cachedSelection = global.selectedImageIds;
			global.selectedImageIds = [];
		} else {
			global.selectedImageIds = cachedSelection;
		}
	}

	function handleRename() {
		if (!(global.selectedImageIds.length === 1)) return;
		const img = global.journeyData?.image.find((i) => i.id === global.selectedImageIds[0]);
		if (img) renameImageModal?.openModal(img);
	}
</script>

{#snippet imgControl(type: iconType, text: string, onclick: () => any)}
	<button
		class={[
			'flex w-fit flex-row items-center gap-1 rounded-md p-1',
			{ 'hover:bg-gray-900': !global.loadingJourney },
			{ 'bg-gray-900': global.imgSelectMode && type === 'selectImages' && !global.loadingJourney }
		]}
		{onclick}
		title={innerWidth < 768 ? text : ''}
	>
		<SVGIcon {type} color={global.loadingJourney ? 'none' : 'white'} hoverScale={false} />
		<div class="max-md:hidden">{text}</div>
	</button>
{/snippet}

{#snippet subImgControl(args: { type: iconType, text: string, onclick: () => void, disabled?: boolean, scale?: number, color?: string, className?: string })}
	{@const { type, text, onclick, disabled = false, scale, color, className } = args}
	<button
		class={[
			'flex flex-row gap-1 enabled:hover:underline disabled:cursor-auto! disabled:opacity-50',
			{ '*:invisible': global.loadingJourney }
		]}
		{disabled}
		{onclick}
		title={text}
	>
		<SVGIcon {type} scale={scale ?? 0.85} {color} class={className} />
		<div class="max-md:hidden">{text}</div>
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
					{journey.name}
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
				<div class="flex w-full flex-row items-end gap-2 py-2">
					<div class="oxygen-bold flex flex-row items-end gap-2 text-5xl">
						Images <div class="text-3xl font-light">{`(${journey.image.length})`}</div>
					</div>
					<div class="flex w-fit flex-row items-center gap-3">
						{@render imgControl('selectImages', 'Select Images', handleSelectMode)}
						{@render imgControl('addImage', 'Add Images', () => addImageModal?.openModal())}
					</div>
				</div>

				<div
					class="flex {global.loadingJourney
						? 'w-fit'
						: 'w-full'} flex-row justify-between *:flex *:items-end *:gap-2"
				>
					<div class="*:items-center">
						{@render subImgControl({
							type: 'delete',
							text: 'Delete',
							onclick: () => deleteImageModal?.openModal(),
							disabled: global.selectedImageIds.length === 0,
							scale: 0.8
						})}
						{@render subImgControl({
							type: 'rename',
							text: 'Rename',
							onclick: () => handleRename(),
							disabled: !(global.selectedImageIds.length === 1),
							color: 'white',
							className: 'pt-0.75'
						})}
					</div>
					{#if global.imgSelectMode}
						<div>
							{@render subImgControl({
								type: 'selectAll',
								text: 'Select all',
								onclick: () => handleSelectAll(),
								color: allImagesSelected ? imgHighlightColor : 'white',
								className: 'pt-0.75'
							})}
							{@render subImgControl({
								type: 'unselectAll',
								text: 'Unselect all',
								onclick: () => handleUnselectAll(),
								className: 'pt-0.75'
							})}
							<div class="flex max-sm:hidden">
								Selected:
								<div class="w-[3ch]">{global.selectedImageIds.length}</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
	<div class="items-top flex size-full flex-col gap-4">
		<div id="mapContainer" class="size-full" bind:this={mapContainer}>
			<Map bind:journeys />
		</div>
	</div>
	{#if global.viewMode === 'journey'}
		<div id="bookContainer" class="animate-slide-right size-full overflow-y-auto">
			<Book {addImageModal} />
		</div>
	{/if}
</div>

<AddImageModal bind:this={addImageModal} {addImageForm} />
<DeleteImageModal bind:this={deleteImageModal} {deleteImageForm} />
<RenameImageModal bind:this={renameImageModal} {renameImageForm} />

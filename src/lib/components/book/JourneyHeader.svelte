<script lang="ts">
	import { global, type JourneyData } from '$lib/state.svelte';
	import { imgHighlightColor, timeRange } from '$lib/utils/client';
	import SVGIcon, { type iconType } from '$lib/components/utility/SVGIcon.svelte';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import DeleteImageModal from '$lib/components/modal/DeleteImageModal.svelte';
	import RenameImageModal from '$lib/components/modal/RenameImageModal.svelte';
	import Header from './Header.svelte';

	let {
		addImageModal,
		deleteImageModal,
		renameImageModal
	}: {
		addImageModal: AddImageModal | undefined;
		deleteImageModal: DeleteImageModal | undefined;
		renameImageModal: RenameImageModal | undefined;
	} = $props();

	let journey = $derived<JourneyData>(global.journeyData);

	let allImagesSelected = $derived(
		global.selectedImageIds.length === global.journeyData?.image.length &&
			global.selectedImageIds.length > 0
	);

	function handleSelectMode() {
		global.imgSelectMode = !global.imgSelectMode;
		global.selectedImageIds = [];
	}

	function handleSelectAll() {
		if (!allImagesSelected && global.journeyData) {
			global.selectedImageIds = global.journeyData.image.map((img) => img.id);
		} else {
			global.selectedImageIds = [];
		}
	}

	function handleUnselectAll() {
		if (global.selectedImageIds.length) global.selectedImageIds = [];
	}

	function handleRename() {
		if (!(global.selectedImageIds.length === 1)) return;
		const img = global.journeyData?.image.find((i) => i.id === global.selectedImageIds[0]);
		if (img) renameImageModal?.openModal(img);
	}
</script>

{#snippet imgControl(args: { type?: iconType, text?: string, onclick?: () => void, disabled?: boolean, scale?: number, color?: string, className?: string })}
	{@const { type, text, onclick, disabled = false, scale, color, className } = args}
	<button
		class={[
			'flex w-fit button-hover flex-row items-center gap-1 rounded-md p-1 disabled:cursor-auto! disabled:opacity-50',
			{ 'hover:bg-gray-900': !global.loadingJourney },
			{ 'bg-gray-900': global.imgSelectMode && type === 'selectImages' && !global.loadingJourney },
			{ '*:invisible': global.loadingJourney }
		]}
		{onclick}
		title={innerWidth < 768 ? text : ''}
		{disabled}
	>
		{#if type}
			<SVGIcon {type} hoverScale={false} scale={scale ?? 0.85} {color} />
		{/if}
		{#if text}<div class="max-md:hidden">{text}</div>{/if}
	</button>
{/snippet}

{#if journey}
	<!------------------- MAP HEADER --------------------->
	<Header slide={'left'}>
		<div class="oxygen-bold truncate pb-2 text-5xl">
			{journey.name}
		</div>
		<div class="flex flex-row gap-2">
			{@render imgControl({
				type: 'calendar',
				scale: 0.75,
				text: timeRange(journey) ?? 'Loading Time Range'
			})}
		</div>
	</Header>
	<!------------------- BOOK HEADER --------------------->
	<Header slide={'right'}>
		<div class="oxygen-bold flex flex-row items-end gap-2 pb-2 text-5xl">
			Images <div class="text-3xl font-light">{`(${journey.image.length})`}</div>
		</div>

		<div
			class="flex flex-row justify-between *:flex *:items-center *:gap-2 {global.loadingJourney
				? 'w-fit'
				: 'w-full'}"
		>
			<div class="animate-slide-left">
				{@render imgControl({
					type: 'selectImages',
					text: 'Select',
					onclick: handleSelectMode
				})}
				{@render imgControl({
					type: 'addImage',
					text: 'Add Images',
					onclick: () => addImageModal?.openModal()
				})}
				<div class="vertical-divider"></div>
				{@render imgControl({
					type: 'delete',
					text: 'Delete',
					onclick: deleteImageModal?.openModal,
					disabled: global.selectedImageIds.length === 0,
					scale: 0.8
				})}
				{@render imgControl({
					type: 'rename',
					text: 'Rename',
					onclick: handleRename,
					disabled: !(global.selectedImageIds.length === 1)
				})}
			</div>
			{#if global.imgSelectMode}
				<div class="animate-slide-right">
					{@render imgControl({
						type: 'selectAll',
						text: 'Select all',
						onclick: handleSelectAll,
						color: allImagesSelected ? imgHighlightColor : 'white'
					})}
					{@render imgControl({
						type: 'unselectAll',
						text: 'Unselect all',
						onclick: handleUnselectAll
					})}
					{@render imgControl({
						text: `Selected: ${global.selectedImageIds.length}`
					})}
				</div>
			{/if}
		</div>
	</Header>
{/if}

<style>
	.vertical-divider {
		width: 1px;
		height: 80%;
		background-color: #ffffff;
		border-radius: 50%;
	}
</style>

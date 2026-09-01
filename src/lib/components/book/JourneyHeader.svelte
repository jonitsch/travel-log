<script lang="ts">
	import { global, type JourneyData } from '$lib/state.svelte';
	import { imgHighlightColor, timeRange } from '$lib/utils/client';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import DeleteImageModal from '$lib/components/modal/DeleteImageModal.svelte';
	import RenameImageModal from '$lib/components/modal/RenameImageModal.svelte';
	import JourneySettingsModal from '$lib/components/modal/JourneySettingsModal.svelte';
	import Header from './Header.svelte';
	import JourneyHeaderButton from './JourneyHeaderButton.svelte';

	let {
		addImageModal,
		deleteImageModal,
		renameImageModal,
		journeySettingsModal
	}: {
		addImageModal: AddImageModal | undefined;
		deleteImageModal: DeleteImageModal | undefined;
		renameImageModal: RenameImageModal | undefined;
		journeySettingsModal: JourneySettingsModal | undefined;
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

{#if journey}
	<!------------------- MAP HEADER --------------------->
	<Header slideDir={'left'}>
		{#snippet headerText()}
			{journey.name}
		{/snippet}
		{#snippet buttons()}
			<JourneyHeaderButton
				type="calendar"
				text={timeRange(journey) ?? 'No dated images yet!'}
				scale={0.75}
				collapseOnMobile={false}
			/>
			<JourneyHeaderButton
				type="settings"
				text="Settings"
				scale={0.75}
				iconAnchor="right"
				onclick={() => journeySettingsModal?.openModal()}
			/>
		{/snippet}
	</Header>
	<!------------------- BOOK HEADER --------------------->
	<Header slideDir={'right'}>
		{#snippet headerText()}
			Images <div class="text-3xl font-light">{`(${journey.image.length})`}</div>
		{/snippet}
		{#snippet buttons()}
			<div class="animate-slide-left">
				<JourneyHeaderButton type="selectImages" text="Select" onclick={handleSelectMode} />
				<JourneyHeaderButton
					type="addImage"
					text="Add Images"
					onclick={() => addImageModal?.openModal()}
				/>
				<div class="vertical-divider"></div>
				<JourneyHeaderButton
					type="delete"
					text="Delete"
					onclick={() => deleteImageModal?.openModal()}
					disabled={global.selectedImageIds.length === 0}
					scale={0.8}
				/>
				<JourneyHeaderButton
					type="rename"
					text="Rename"
					onclick={handleRename}
					disabled={!(global.selectedImageIds.length === 1)}
				/>
			</div>

			{#if global.imgSelectMode}
				<div class="animate-slide-right">
					<JourneyHeaderButton
						type="selectAll"
						text="Select all"
						onclick={handleSelectAll}
						color={allImagesSelected ? imgHighlightColor : 'white'}
					/>
					<JourneyHeaderButton type="unselectAll" text="Unselect all" onclick={handleUnselectAll} />
					<JourneyHeaderButton
						text="Select Mode"
						type="x"
						title="Exit Select Mode"
						onclick={handleSelectMode}
						color="black"
						className="text-black bg-highlight hover:bg-highlight"
						iconAnchor="right"
					/>
				</div>
			{/if}
		{/snippet}
	</Header>
{/if}

<style>
	.vertical-divider {
		width: 1px;
		height: 80%;
		background-color: #ccc;
		border-radius: 50%;
	}
</style>

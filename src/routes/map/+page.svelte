<script lang="ts">
	import Map from '$lib/components/map/Map.svelte';
	import type { PageProps } from './$types';
	import { global } from '$lib/state.svelte';
	import type { Journey } from '$gen/prisma/client/client';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import Book from '$lib/components/book/Book.svelte';
	import DeleteImageModal from '$lib/components/modal/DeleteImageModal.svelte';
	import RenameImageModal from '$lib/components/modal/RenameImageModal.svelte';
	import BookHeader from '$lib/components/book/BookHeader.svelte';

	let { data }: PageProps = $props();

	let { deleteImageForm, addImageForm, renameImageForm } = $derived(data);

	let journeys = $derived<Journey[]>(data.journeys);
	let mapContainer = $state<HTMLDivElement>();

	let addImageModal = $state<AddImageModal>(),
		deleteImageModal = $state<DeleteImageModal>(),
		renameImageModal = $state<RenameImageModal>();
</script>

<div
	class="grid size-full {global.viewMode === 'journey'
		? 'grid-cols-[35%_1fr] grid-rows-[auto_1fr]'
		: ''} gap-4 overflow-hidden"
>
	{#if global.viewMode === 'journey'}
		<BookHeader {addImageModal} {renameImageModal} {deleteImageModal} />
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

<script lang="ts">
	import { Marker } from 'svelte-maplibre';
	import { global } from '$lib/state.svelte';
	import { getImgProxyURL } from '../imgproxy';
	import { handleImageSelection, handleShowOnMapClick } from '../utils/client';
	import type { Image } from '$gen/prisma/client/client';

	let { img, color }: { img: Image; color: string } = $props();

	let map: maplibregl.Map | null = global.map;
	let thisMarker = $state<maplibregl.Marker>();

	let imageError = $state<boolean>(false),
		imgSelected = $derived(
			global.selectedImageIds.filter((id) => id === img.id).length ? true : false
		);

	$effect(() => {
		const selectedIds = global.selectedImageIds;
		if (!thisMarker) return;
		if (selectedIds.filter((id) => id === img.id).length) {
			thisMarker.addClassName('z-9999');
		} else {
			thisMarker.removeClassName('z-9999');
		}
	});

	function scrollToBookPic(id: string) {
		document.getElementById(`bookpic-${id}`)?.scrollIntoView({ behavior: 'smooth' });
	}

	function handleSingleClick() {
		if (!map || !img.lng || !img.lat) return;
		if (global.imgSelectMode) {
			handleImageSelection(img.id);
			return;
		}
		global.selectedImageIds = [img.id];
		scrollToBookPic(img.id);
	}

	function handleDoubleClick() {
		if (global.imgSelectMode) {
			scrollToBookPic(img.id);
			handleImageSelection(img.id);
			return;
		}
		handleShowOnMapClick(img);
	}
</script>

{#if img.lng && img.lat}
	{#if !imageError}
		<Marker
			bind:marker={thisMarker}
			lngLat={[img.lng, img.lat]}
			class={'flex size-7 items-center justify-center rounded-lg focus:outline-2 focus:outline-black'}
			onclick={() => handleSingleClick()}
			ondblclick={() => handleDoubleClick()}
		>
			{#await getImgProxyURL(img.path, img.width * 0.05, img.height * 0.05)}
				<div class="h-full w-full bg-{color} rounded-lg"></div>
			{:then response}
				<img
					id="mappic-{img.id}"
					src={response}
					alt={img.fileName}
					class={[
						'size-full cursor-pointer rounded-lg hover:z-50 hover:border-2 hover:border-black',
						{ 'ring-4 ring-(--img-highlight-color)': imgSelected }
					]}
					onerror={() => thisMarker?.remove()}
				/>
			{/await}
		</Marker>
	{/if}
{/if}

<style>
	.highlighted {
		border: solid 3px var(--img-highlight-color);
	}
</style>

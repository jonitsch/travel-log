<script lang="ts">
	import { Marker, Popup } from 'svelte-maplibre';
	import type { Image } from '$lib/server/prisma';
	import { global } from '$lib/state.svelte';
	import { getImgProxyURL } from '../imgproxy';
	import { getBBox } from '../utils';

	let { img, color, zoom = $bindable() }: { img: Image; color: string; zoom: number } = $props();

	let map: maplibregl.Map | null = global.map;
	let thisMarker = $state<maplibregl.Marker>();
	let timeout = $state<NodeJS.Timeout>();

	let imgSelected = $derived.by<boolean>(() => img.id === global.selectedImageId);

	$effect(() => {
		const selectedId = global.selectedImageId;
		if (!thisMarker) return;
		if (img.id === selectedId) {
			thisMarker.addClassName('z-[9999]');
		} else {
			thisMarker.removeClassName('z-[9999]');
		}
	});

	function handleSingleClick() {
		if (!map || !img.lng || !img.lat) return;
		global.selectedImageId = img.id;
		document.getElementById(`bookpic-${img.id}`)?.scrollIntoView({ behavior: 'smooth' });
	}

	function handleDoubleClick() {
		if (!map || !img.lng || !img.lat || !global.journeyData) return;
		console.log('Double click detected, clearing timeout:', timeout);
		clearTimeout(timeout);
		if (
			imgSelected &&
			map.getCenter().lng.toFixed(4) === img.lng.toFixed(4) &&
			map.getZoom() === 15
		) {
			const bbox = getBBox(global.journeyData);
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
			global.selectedImageId = null;
		} else {
			map.flyTo({ center: [img.lng, img.lat], zoom: 15, speed: 2 });
			global.selectedImageId = img.id;
		}
	}
</script>

{#if img.lng && img.lat}
	<Marker
		bind:marker={thisMarker}
		lngLat={[img.lng, img.lat]}
		class={'size-7 place-items-center rounded-full focus:outline-2 focus:outline-black'}
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
					{ 'ring-4 ring-[var(--img-highlight-color)]': img.id === global.selectedImageId }
				]}
			/>
		{/await}
	</Marker>
{/if}

<style>
	.highlighted {
		border: solid 3px var(--img-highlight-color);
	}
</style>

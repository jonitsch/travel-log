<script lang="ts">
	import { Marker, Popup } from 'svelte-maplibre';
	import type { Image } from '$lib/server/prisma';
	import { global } from '$lib/state.svelte';
	import { getImgProxyURL } from '../imgproxy';

	let { img, color, zoom = $bindable() }: { img: Image; color: string; zoom: number } = $props();

	let map: maplibregl.Map | undefined = $derived.by(() => {
		if (global.map) {
			return map!;
		}
	});
	let thisMarker = $state<maplibregl.Marker>();

	$effect(() => {
		const selectedId = global.selectedImageId;
		if (!thisMarker) return;
		if (img.id === selectedId) {
			thisMarker.addClassName('z-[9999]');
		} else {
			thisMarker.removeClassName('z-[9999]');
		}
	});
</script>

{#if img.lng && img.lat}
	<Marker
		bind:marker={thisMarker}
		lngLat={[img.lng, img.lat]}
		class={'size-7 place-items-center rounded-full focus:outline-2 focus:outline-black'}
		ondblclick={() => {
			let newZoom = (zoom ?? 0) + 5;
			map!.flyTo({ center: [img.lng!, img.lat!], zoom: newZoom });
		}}
		onclick={() => {
			global.selectedImageId = img.id;
			document.getElementById(`bookpic-${img.id}`)?.scrollIntoView({ behavior: 'smooth' });
		}}
	>
		{#await getImgProxyURL(img.path, img.width * 0.05, img.height * 0.05)}
			<div class="h-full w-full bg-{color} rounded-lg"></div>
		{:then response}
			<img
				id="mappic-{img.id}"
				src={response}
				alt={img.fileName}
				class={[
					'size-full cursor-pointer rounded-lg hover:z-50 hover:ring-2 hover:ring-[orangered]',
					{ 'ring-2 ring-[orangered]': img.id === global.selectedImageId }
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

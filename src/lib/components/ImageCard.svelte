<script lang="ts">
	import type { Image } from '../server/prisma';
	import FullImageModal from './FullImageModal.svelte';
	import SVGIcon from './SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, getBBox } from '../utils';
	import { tick } from 'svelte';

	let {
		img,
		src,
		fullImageModal
	}: { img: Image; src: string; fullImageModal: FullImageModal | undefined } = $props();

	let imageLoaded = $state<boolean>(false);
	let selectedId = $state<string>();
	let journey = $derived(global.journeyData);
</script>

<div id="imageCard-{img.id}" class="relative block">
	<div
		id="imageControlOverlay"
		class="group absolute inset-0 flex items-end rounded-md bg-transparent hover:bg-slate-900/30"
	>
		<div
			class="invisible flex h-fit w-full flex-row flex-nowrap justify-evenly group-hover:visible"
		>
			<button
				id="viewFullImageButton-{img.id}"
				title="View Full Image"
				onclick={() => fullImageModal?.open(img)}
			>
				<SVGIcon type="fullscreen" />
			</button>
			{#if img.lng && img.lat}
				<button
					id="showOnMapButton-{img.id}"
					title="Show Image on Map"
					onclick={() => {
						if (!global.map || !img.lng || !img.lat) return;
						const map = global.map;
						if (
							selectedId === img.id &&
							map.getCenter().lng.toFixed(4) === img.lng.toFixed(4) &&
							map.getZoom() === 13
						) {
							const bbox = getBBox(journey!);
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
							selectedId = undefined;
						} else {
							map.flyTo({ center: [img.lng, img.lat], zoom: 13, speed: 2 });
							selectedId = img.id;
						}
					}}
				>
					<SVGIcon type="marker" stroke={img.id === selectedId ? 'lightgreen' : 'white'} />
				</button>
			{:else}
				<button title="Image has no Coordinate Data" disabled>
					<SVGIcon type="marker" disabled />
				</button>
			{/if}
		</div>
	</div>
	<img
		id="bookpic-{img.id}"
		{src}
		alt={img.fileName}
		class="h-full w-full cursor-pointer rounded-md object-cover text-white
												transition duration-100 ease-in-out hover:scale-105"
		loading="lazy"
		onload={() =>
			awaitImageRender(async () => {
				await tick();
				imageLoaded = true;
			})}
	/>
</div>

<style>
	button {
		display: flex;
		width: 100%;
		justify-content: center;
		background-color: rgb(15 23 42 / 0.8);
		padding-top: 0.5rem /* 8px */;
		padding-bottom: 0.5rem /* 8px */;
	}
	button:hover {
		background-color: rgb(15 23 42 / 0.9);
		border: inset 2px solid rgba(0, 0, 0, 0.385);
	}
</style>

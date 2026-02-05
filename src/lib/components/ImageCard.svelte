<script lang="ts">
	import type { Image } from '../server/prisma';
	import FullImageModal from './FullImageModal.svelte';
	import SVGIcon from './SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, getBBox } from '../utils';
	import { tick } from 'svelte';

	interface Props {
		img: Image;
		src: string;
		fullImageModal: FullImageModal | undefined;
	}
	let { img, src, fullImageModal }: Props = $props();

	let imageLoaded = $state<boolean>(false);
	let imgHasCoordinateData = $derived.by<boolean>(() => {
		if (img.lng && img.lat) {
			return true;
		} else {
			return false;
		}
	});
	let selectedId = $state<string>();
	let journey = $derived(global.journeyData);
	let hovered = $state<boolean>(false);

	function handleShowOnMapClick() {
		if (!global.map || !img.lng || !img.lat) return;
		const map = global.map;
		if (
			selectedId === img.id &&
			map.getCenter().lng.toFixed(4) === img.lng.toFixed(4) &&
			map.getZoom() === 15
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
			global.selectedImageId = null;
		} else {
			map.flyTo({ center: [img.lng, img.lat], zoom: 15, speed: 2 });
			selectedId = img.id;
			global.selectedImageId = img.id;
		}
	}
</script>

<div
	id="imageCard-{img.id}"
	role="gridcell"
	tabindex="0"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	class="relative block size-full"
>
	<img
		id="bookpic-{img.id}"
		{src}
		alt={img.fileName}
		class={[
			'size-full cursor-pointer rounded-md object-cover transition duration-100 ease-in-out hover:scale-105'
		]}
		onload={() =>
			awaitImageRender(async () => {
				await tick();
				imageLoaded = true;
			})}
	/>
	{#if hovered}
		<div
			id="imageControlOverlay"
			class="group absolute inset-0 flex flex-col justify-end rounded-md bg-transparent hover:bg-slate-900/10"
		>
			<div
				id="bottomControl"
				class="invisible flex h-fit w-full flex-row flex-nowrap justify-evenly group-hover:visible"
			>
				<button
					id="viewFullImageButton-{img.id}"
					title="View Full Image"
					onclick={() => fullImageModal?.open(img)}
				>
					<SVGIcon type="fullscreen" />
				</button>
				<button
					id="showOnMapButton-{img.id}"
					title="Show on map"
					onclick={() => handleShowOnMapClick()}
					disabled={!imgHasCoordinateData}
				>
					<SVGIcon
						type="marker"
						stroke={img.id === global.selectedImageId ? '#2dd4bf' : 'white'}
						disabled={!imgHasCoordinateData}
					/>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.highlighted {
		border: inset 5px var(--image-highlight-color);
	}

	#bottomControl {
		transform-origin: bottom;
		animation: growIn 120ms cubic-bezier(0.2, 0, 0.38, 0.9);
	}
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

	@keyframes growIn {
		from {
			transform: scaleY(0);
			opacity: 0.8;
		}
		to {
			transform: scaleY(1);
			opacity: 1;
		}
	}
</style>

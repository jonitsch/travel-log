<script lang="ts">
	import type { Image } from '../server/prisma';
	import FullImageModal from './FullImageModal.svelte';
	import SVGIcon from './SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, getBBox } from '../utils';
	import { tick } from 'svelte';
	import ErrorMessage from './ErrorMessage.svelte';

	interface Props {
		img: Image;
		src: string;
		fullImageModal: FullImageModal | undefined;
	}
	let { img, src, fullImageModal }: Props = $props();

	let imageLoaded = $state<boolean>(false),
		imageError = $state<boolean>(false);
	let journey = global.journeyData;

	let imgHasCoordinates = $derived.by<boolean>(() => img.lng != null && img.lat != null),
		imgSelected = $derived.by<boolean>(() => img.id === global.selectedImageId);

	let hovered = $state<boolean>(false);

	function handleShowOnMapClick() {
		if (!global.map || !img.lng || !img.lat) return;
		const map = global.map;
		if (
			imgSelected &&
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
			global.selectedImageId = null;
		} else {
			map.flyTo({ center: [img.lng, img.lat], zoom: 15, speed: 2 });
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
	{#if imageError}
		<div
			class="flex h-full flex-col items-center rounded-md border-4 border-gray-900 bg-red-900 p-3"
		>
			<div class="text-white">{img.fileName}</div>
			<div class="flex-1 flex items-center">
				<ErrorMessage>
					<div class="flex flex-col items-center justify-center break-words text-center">
						Image failed to load!
						<SVGIcon type="imageError" fill="white" scale={2.5} />
					</div>
				</ErrorMessage>
			</div>
		</div>
	{:else}
		<img
			id="bookpic-{img.id}"
			{src}
			alt={img.fileName}
			class="size-full cursor-pointer rounded-md object-cover transition duration-100 ease-in-out"
			class:highlighted={imgSelected}
			onload={() =>
				awaitImageRender(async () => {
					await tick();
					imageLoaded = true;
				})}
			onerror={() => (imageError = true)}
		/>
		{#if hovered}
			<div
				id="imageControlOverlay"
				class={[
					'group absolute inset-0 flex flex-col justify-end rounded-md bg-transparent hover:bg-slate-900/10'
				]}
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
						disabled={!imgHasCoordinates}
					>
						<SVGIcon
							type="marker"
							stroke={img.id === global.selectedImageId ? '#2dd4bf' : 'white'}
							disabled={!imgHasCoordinates}
						/>
					</button>
				</div>
			</div>
		{/if}
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

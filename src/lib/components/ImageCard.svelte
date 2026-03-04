<script lang="ts">
	import FullImageModal from './modal/FullImageModal.svelte';
	import SVGIcon from './SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, handleShowOnMapClick } from '../utils/client';
	import { tick } from 'svelte';
	import ErrorMessage from './ErrorMessage.svelte';
	import type { Image } from '$gen/prisma/client/client';

	interface Props {
		img: Image;
		src: string;
		fullImageModal?: FullImageModal | undefined;
	}
	let { img, src, fullImageModal }: Props = $props();

	let imageLoaded = $state<boolean>(false),
		imageError = $state<boolean>(false);

	let imgHasCoordinates = $derived.by<boolean>(() => img.lng != null && img.lat != null),
		imgSelected = $derived<boolean>(img.id === global.selectedImageId);

	let hovered = $state<boolean>(false);
</script>

<div
	id="imageCard-{img.id}"
	role="gridcell"
	tabindex="0"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	class="relative block size-full overflow-hidden rounded-md"
	class:highlighted={imgSelected}
>
	{#if imageError}
		<div
			class="flex h-full flex-col items-center rounded-md border-4 border-gray-900 bg-red-900 p-3"
		>
			<div class="text-white">{img.fileName}</div>
			<div class="flex flex-1 items-center">
				<ErrorMessage>
					<div class="flex flex-col items-center justify-center text-center wrap-break-word">
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
			class="size-full cursor-pointer object-cover transition duration-100 ease-in-out"
			onload={() =>
				awaitImageRender(async () => {
					await tick();
					imageLoaded = true;
				})}
			onerror={() => (imageError = true)}
		/>
		{#if hovered || imgSelected}
			<div
				id="imageControlOverlay"
				class="absolute inset-0 flex flex-col justify-end bg-transparent hover:bg-slate-900/10"
			>
				<div id="bottomControl" class="flex h-fit w-full flex-row flex-nowrap justify-evenly">
					<button
						id="viewFullImageButton-{img.id}"
						title="View Full Image"
						onclick={() => fullImageModal?.openModal(img)}
					>
						<SVGIcon type="fullscreen" />
					</button>
					<button
						id="showOnMapButton-{img.id}"
						title={imgHasCoordinates ? 'Show on map' : 'Image has no coordinate data'}
						onclick={() => handleShowOnMapClick(img)}
						disabled={!imgHasCoordinates}
					>
						<SVGIcon
							type="marker"
							stroke={imgSelected ? '#2dd4bf' : 'white'}
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
		border: inset 5px var(--img-highlight-color);
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

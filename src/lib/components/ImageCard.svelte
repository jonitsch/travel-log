<script lang="ts">
	import FullImageModal from './modal/FullImageModal.svelte';
	import SVGIcon from './SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, handleImageSelection, handleShowOnMapClick } from '../utils/client';
	import { tick } from 'svelte';
	import ErrorMessage from './ErrorMessage.svelte';
	import type { Image } from '$gen/prisma/client/client';

	interface Props {
		img: Image;
		src: string;
		fullImageModal?: FullImageModal | undefined;
	}
	let { img, src, fullImageModal }: Props = $props();

	let imgRendered = $state<boolean>(false),
		imgError = $state<boolean>(false);

	let imgHasCoordinates = $derived.by<boolean>(() => img.lng != null && img.lat != null),
		imgSelected = $derived<boolean>(
			global.selectedImageIds?.filter((id) => img.id === id).length ? true : false
		),
		imgShownOnMap = $derived<boolean>(global.imgShownOnMap === img.id);

	let hovered = $state<boolean>(false);
</script>

<div
	id="imageCard-{img.id}"
	role="gridcell"
	tabindex="0"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	onkeydown={(e) => {
		if (e.key === 'Enter') handleImageSelection(img.id);
	}}
	onclick={() => handleImageSelection(img.id)}
	class="relative block size-full overflow-hidden rounded-md"
	class:highlightBorder={imgSelected}
>
	{#if imgError}
		<div class="flex size-full flex-col items-center rounded-md bg-red-900 p-3">
			<div class="w-[90%] truncate text-white">{img.fileName}</div>
			u
			<div class="flex flex-1 items-center">
				<ErrorMessage>
					<div class="flex flex-col items-center justify-center text-center">
						Image failed to load!
						<SVGIcon type="imgError" fill="white" stroke="white" scale={2.5} hoverScale={false} />
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
					imgRendered = true;
				})}
			onerror={() => (imgError = true)}
		/>
		{#if imgSelected}
			<div class="highlightBorderOverlay"></div>
		{/if}
		{#if hovered || imgSelected}
			{#if !global.imgSelectMode}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					id="imageControlOverlay"
					class="absolute inset-0 flex flex-col justify-end bg-transparent hover:bg-slate-900/10"
				>
					<div
						id="bottomControl"
						class="flex h-fit w-full flex-row flex-nowrap justify-evenly {imgSelected
							? 'mb-1.25'
							: ''}"
					>
						<button
							id="viewFullImageButton-{img.id}"
							title="View Full Image"
							onclick={() => fullImageModal?.openModal(img)}
						>
							<SVGIcon type="fullscreen" stroke="white" hoverScale />
						</button>
						<button
							id="showOnMapButton-{img.id}"
							title={imgHasCoordinates
								? !imgShownOnMap
									? 'Show on Map'
									: 'Zoom back out'
								: 'Image has no coordinate data'}
							onclick={(e) => {
								if (imgSelected) e.stopPropagation();
								handleShowOnMapClick(img);
							}}
							disabled={!imgHasCoordinates}
						>
							<SVGIcon
								type="marker"
								stroke={imgShownOnMap && imgSelected ? 'rgb(45, 212, 190)' : 'white'}
								disabled={!imgHasCoordinates}
								hoverScale
							/>
						</button>
					</div>
				</div>
			{:else}
				<div
					id="imageSelectOverlay"
					class={[
						'absolute inset-0 flex flex-col items-center justify-center bg-transparent',
						{ 'hover:bg-slate-900/40': !imgSelected }
					]}
					aria-label="Select Image"
				>
					{#if hovered}
						<div
							class="size-8 rounded-full border-2 border-white"
							class:highlightBackground={imgSelected}
						></div>
					{/if}
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.highlightBorderOverlay {
		position: absolute;
		z-index: 1000;
		inset: 0;
		pointer-events: none;
		box-shadow: 0 0 0 5px var(--img-highlight-color) inset;
		border-radius: inherit;
		animation: border-fade 0.1s ease-in-out;
	}

	@keyframes border-fade {
		0% {
			box-shadow: 0 0 0 0px inset;
		}

		100% {
			box-shadow: 0 0 0 5px var(--img-highlight-color) inset;
		}
	}

	.highlightBackground {
		background-color: var(--img-highlight-color);
		opacity: 50%;
	}

	#imageControlOverlay > #bottomControl {
		transform-origin: bottom;
		animation: growIn 120ms cubic-bezier(0.2, 0, 0.38, 0.9);
	}

	#bottomControl > button {
		display: flex;
		width: 100%;
		justify-content: center;
		background-color: rgb(15 23 42 / 0.8);
		padding-top: 0.5rem /* 8px */;
		padding-bottom: 0.5rem /* 8px */;
	}
	#bottomControl > button:hover {
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

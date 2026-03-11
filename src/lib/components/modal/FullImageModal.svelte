<script lang="ts">
	import { getImgProxyURL } from '$lib/imgproxy';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, formattedDate } from '../../utils/client';
	import { tick } from 'svelte';
	import ErrorMessage from '../ErrorMessage.svelte';
	import type { Image } from '$gen/prisma/client/client';
	import Modal from './Modal.svelte';
	import SVGIcon from '../SVGIcon.svelte';

	let open = $state(false);
	let imgRendered = $state(false);

	let img = $state<Image | undefined>(),
		imgCon = $state<HTMLDivElement | undefined>(),
		imgElement = $state<HTMLImageElement | undefined>();

	let dateDisplay = $state<HTMLDivElement | undefined>();

	function getImageIndex(): number {
		let index: number = -1;
		const images = global.journeyData?.image;
		if (!images || !img) {
			if (!images) throw new Error('Global Journey Data is undefined!');
			if (!img) throw new Error('Image is undefined!');
		} else {
			const cImg: Image = img;
			index = images.findIndex((img) => img.id === cImg.id);
		}
		if (index === -1) throw new Error(`Index not found for image: ${img?.fileName}`);
		return index;
	}
	async function switchImage(direction: 'forward' | 'backward') {
		const images = global.journeyData?.image;
		const index: number = getImageIndex();
		const crement = direction === 'forward' ? 1 : -1;
		if (!images || !img) {
			if (!images) throw new Error('Global Journey Data is undefined!');
			if (!img) throw new Error('Image is undefined!');
		}
		if (index + crement >= 0 && index + crement <= images.length - 1) {
			openModal(images[index + crement]);
		}
	}

	export async function openModal(image: Image) {
		reset();
		open = true;
		img = image;
	}
	export async function closeModal() {
		reset();
		open = false;
	}
	function reset() {
		imgCon = undefined;
		imgElement = undefined;
		imgRendered = false;
		img = undefined;
		if (dateDisplay) dateDisplay.classList.add('invisible');
	}

	$effect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (img && imgRendered) {
				switch (e.key) {
					case 'ArrowRight':
						e.preventDefault();
						switchImage('forward');
						break;
					case 'ArrowLeft':
						e.preventDefault();
						switchImage('backward');
						break;
					case 'ArrowDown':
						e.preventDefault();
					case 'ArrowUp':
						e.preventDefault();
					case 'Enter':
						e.preventDefault();
				}
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<Modal bind:open>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	{#if global.journeyData}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="flex w-dvw flex-row items-center justify-between px-5" onclick={() => closeModal()}>
			<button
				class="navArrow animate-slide-left"
				aria-label="View previous Image"
				onclick={(e) => {
					e.stopPropagation();
					switchImage('backward');
				}}
				disabled={getImageIndex() <= 0}
			>
				<SVGIcon type="leftArrow" stroke="white" hoverScale={false} />
			</button>
			<div class="flex h-dvh flex-col items-center justify-between p-5">
				{#if img}
					{@const { width, height, path, id, fileName, createdOn } = img}
					{#if imgRendered}
						<div id="fileNameDisplay" class="animate-modal-in h-fit text-white">{img.fileName}</div>
					{/if}
					<div
						id="imgCon"
						bind:this={imgCon}
						class="animate-modal-in relative rounded-lg shadow-xl"
					>
						{#await getImgProxyURL(path, width / 3, height / 3) then response}
							<img
								bind:this={imgElement}
								id="fullpic-{id}"
								src={response}
								alt={fileName}
								class="animate-modal-in block max-h-[75dvh] max-w-[85dvw] min-w-[15dvw]"
								class:opacity-0={!imgRendered}
								class:opacity-100={imgRendered}
								loading="eager"
								onload={() => {
									awaitImageRender(async () => {
										await tick();
										imgRendered = true;
									});
								}}
							/>
						{:catch error}
							<ErrorMessage {error}>Image Failed To Load!</ErrorMessage>
						{/await}
					</div>
					{#if imgRendered}
						<div
							bind:this={dateDisplay}
							id="dateDisplay"
							class="animate-modal-in min-w-fit text-xl text-white"
						>
							{formattedDate(createdOn, 'dd/mm/yyyy hh:mm:ss')}
						</div>
					{/if}
				{/if}
			</div>
			<button
				class="navArrow animate-slide-right"
				aria-label="View next Image"
				onclick={(e) => {
					e.stopPropagation();
					switchImage('forward');
				}}
				disabled={getImageIndex() >= global.journeyData.image.length - 1}
			>
				<SVGIcon type="rightArrow" stroke="white" hoverScale={false} />
			</button>
		</div>
	{/if}
</Modal>

<style>
	.navArrow {
		padding: 20px;
		border-radius: 50%;
		opacity: 80%;
	}
	.navArrow:hover:enabled {
		background-color: #101828;
	}
	.navArrow:disabled {
		opacity: 0.2;
		cursor: auto;
	}
</style>

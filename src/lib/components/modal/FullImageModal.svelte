<script lang="ts">
	import { getImgProxyURL } from '$lib/imgproxy';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, formattedDate } from '../../utils/client';
	import { tick } from 'svelte';
	import ErrorMessage from '../ErrorMessage.svelte';
	import type { Image } from '$gen/prisma/client/client';
	import Modal from './Modal.svelte';

	let open = $state(false);
	let imgLoaded = $state(false);

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
		imgLoaded = false;
		img = undefined;
		if (dateDisplay) dateDisplay.classList.add('invisible');
	}

	$effect(() => {
		if (!open) return;
		function handleKey(e: KeyboardEvent) {
			if (img && imgLoaded) {
				switch (e.key) {
					case 'ArrowRight':
						e.preventDefault();
						switchImage('forward');
						break;
					case 'ArrowLeft':
						e.preventDefault();
						switchImage('backward');
						break;
					case 'Escape':
						e.preventDefault();
						closeModal();
						break;
					case 'ArrowDown':
						e.preventDefault();
					case 'ArrowUp':
						e.preventDefault();
				}
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<Modal bind:open>
	<div class="flex flex-col items-center justify-between gap-5">
		{#if img}
			{@const { width, height, path, id, fileName, createdOn } = img}
			{#if imgLoaded}
				<div id="fileNameDisplay" class="animate-modal-in h-fit text-white">{img.fileName}</div>
			{/if}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				id="imgCon"
				bind:this={imgCon}
				class="animate-modal-in relative rounded-lg shadow-xl"
			>
				{#await getImgProxyURL(path, width / 3, height / 3) then response}
					{#if !imgLoaded}
						<div class="w-xl skeleton"></div>
					{/if}
					<img
						bind:this={imgElement}
						id="fullpic-{id}"
						src={response}
						alt={fileName}
						class="block h-[75dvh] max-w-[85dvw] min-w-[15dvw] animate-modal-in"
						class:opacity-0={!imgLoaded}
						class:opacity-100={imgLoaded}
						loading="eager"
						onload={() => {
							awaitImageRender(async () => {
								await tick();
								imgLoaded = true;
							});
						}}
					/>
				{:catch error}
					<ErrorMessage {error}>Image Failed To Load!</ErrorMessage>
				{/await}
			</div>
			{#if imgLoaded}
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
</Modal>

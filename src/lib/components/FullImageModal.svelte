<script lang="ts">
	import { getImgProxyURL } from '$lib/imgproxy';
	import { global } from '$lib/state.svelte';
	import { awaitImageRender, formattedDate } from '../utils';
	import { tick } from 'svelte';
	import ErrorMessage from './ErrorMessage.svelte';
	import type { Image } from '$gen/prisma/client/client';

	let modal = $state<HTMLDivElement | undefined>();
	let isModalOpen = $state<boolean>(false);
	let imageLoaded = $state<boolean>(false);

	let img = $state<Image | undefined>(),
		imgCon = $state<HTMLDivElement | undefined>(),
		imgElement = $state<HTMLImageElement | undefined>();

	let dateDisplay = $state<HTMLDivElement | undefined>();
	let skeletonImg = $state<HTMLDivElement | undefined>();

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
			document.getElementById(`fullpic-${img.id}`)?.remove();
			open(images[index + crement]);
		}
	}

	export async function open(image: Image) {
		reset();
		isModalOpen = true;
		img = image;
	}
	export async function close() {
		reset();
		isModalOpen = false;
	}
	function reset() {
		imgCon = undefined;
		imgElement = undefined;
		imageLoaded = false;
		img = undefined;
		if (dateDisplay) dateDisplay.classList.add('invisible');
	}

	$effect(() => {
		if (!isModalOpen) return;
		function handleKey(e: KeyboardEvent) {
			if (img && imageLoaded) {
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
						close();
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

{#if isModalOpen && img}
	{@const { width, height, path, id, fileName, createdOn } = img}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={modal}
		class="fixed inset-0 z-9999 flex h-dvh w-dvw cursor-default flex-col items-center justify-between gap-5 bg-black/90 p-5"
		onclick={() => close()}
	>
		<div id="fileNameDisplay" class="h-fit text-white">{img?.fileName}</div>

		<div
			id="imgCon"
			bind:this={imgCon}
			class="animate-modal-in relative rounded-lg shadow-xl"
			onclick={(e) => e.stopPropagation()}
		>
			{#await getImgProxyURL(path, width / 3, height / 3) then response}
				<img
					bind:this={imgElement}
					id="fullpic-{id}"
					src={response}
					alt={fileName}
					class="block h-auto max-h-[85dvh] max-w-[85dvw] min-w-[15dvw]"
					class:opacity-0={!imageLoaded}
					class:opacity-100={imageLoaded}
					loading="eager"
					onload={() => {
						awaitImageRender(async () => {
							await tick();
							imageLoaded = true;
							if (dateDisplay) dateDisplay.classList.remove('invisible');
						});
					}}
				/>
			{:catch error}
				<ErrorMessage {error}>Image Failed To Load!</ErrorMessage>
			{/await}
		</div>
		<div
			bind:this={dateDisplay}
			id="dateDisplay"
			class="invisible min-w-fit text-2xl text-white"
		>
			{formattedDate(createdOn, 'dd/mm/yyyy hh:mm:ss')}
		</div>
	</div>
{/if}

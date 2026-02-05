<script lang="ts">
	import { getImgProxyURL } from '$lib/imgproxy';
	import type { Image } from '$lib/server/prisma';
	import { global } from '$lib/state.svelte';
	import { slide } from 'svelte/transition';
	import { awaitImageRender, formattedDate } from '../utils';
	import { tick } from 'svelte';
	import ErrorMessage from './ErrorMessage.svelte';

	let modal = $state<HTMLButtonElement | undefined>();
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

{#if isModalOpen}
	<button
		type="button"
		bind:this={modal}
		class="cursor-default fixed inset-0 z-[9999] flex h-dvh w-dvw flex-col items-center justify-center bg-black/80"
		onclick={() => close()}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		{#if img}
			{@const { width, height, path, id, fileName, createdOn } = img}
			<div
				id="imgCon"
				bind:this={imgCon}
				class="relative h-fit max-h-[75dvh] w-fit max-w-[70dvw] justify-center rounded-lg shadow-xl"
				onclick={(e) => e.stopPropagation()}
			>
				{#if !imageLoaded}
					<div
						bind:this={skeletonImg}
						id="skeletonImg"
						class="absolute inset-0 z-[1000] animate-pulse bg-slate-600 object-contain"
					></div>
				{/if}
				{#await getImgProxyURL(path, width / 3, height / 3) then response}
					<img
						bind:this={imgElement}
						id="fullpic-{id}"
						src={response}
						alt={fileName}
						class="relative h-fit max-h-full w-fit min-w-[300px] max-w-full object-contain"
						loading="eager"
						{height}
						{width}
						onload={() => {
							awaitImageRender(async () => {
								await tick();
								imageLoaded = true;
								if (dateDisplay) dateDisplay.classList.remove('invisible');
							});
						}}
					/>
				{:catch error}
					<ErrorMessage {error}>
						Image Failed To Load!
					</ErrorMessage>
				{/await}
				<div
					bind:this={dateDisplay}
					id="dateDisplay"
					class="invisible min-w-fit flex-none rounded-b-md bg-gray-900 p-2 py-1 text-3xl text-white"
				>
					{formattedDate(createdOn, 'dd/mm/yyyy hh:mm:ss')}
				</div>
			</div>
		{/if}
	</button>
{/if}

<style>
	#imgCon {
		animation: modal-in 0.3s ease forwards;
	}

	@keyframes modal-in {
		0% {
			opacity: 0;
			transform: translateY(-20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Keyframes for modal exit (optional) */
	@keyframes modal-out {
		0% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-20px);
		}
	}
</style>

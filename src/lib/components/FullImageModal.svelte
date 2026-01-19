<script lang="ts">
	import { getImgProxyURL } from '$lib/imgproxy';
	import type { Image } from '$lib/server/prisma';
	import { global } from '$lib/state.svelte';
	import { slide } from 'svelte/transition';
	import { awaitImageRender } from '../utils';
	import { tick } from 'svelte';

	let modal = $state<HTMLButtonElement | undefined>();
	let isModalOpen = $state<boolean>(false);
	let img = $state<Image | undefined>();
	let imgCon = $state<HTMLDivElement | undefined>();
	let imgElement = $state<HTMLImageElement | undefined>();
	let dateDisplay = $state<HTMLDivElement | undefined>();
	let imageLoaded = $state<boolean>(false);
	let formattedDate = (imgDate: Date) => {
		let date = new Date(imgDate);
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	};
	function getImageIndex(): number {
		let index: number = -1;
		const images = global.journeyData?.image;
		if (!images || !img) {
			if (!images) throw new Error('Global Journey Data is undefined!');
			if (!img) throw new Error('Image is undefined!');
		} else {
			const cImg: Image = img;
			index = images.findIndex((i) => i.id === cImg.id);
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
						e.stopPropagation();
					case 'ArrowUp':
						e.stopPropagation();
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
		class="fixed inset-0 z-[999] flex h-dvh w-dvw flex-col items-center justify-center bg-black/80"
		onclick={() => close()}
	>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			bind:this={imgCon}
			class="relative max-h-[70dvh] max-w-[90dvw] flex-1 flex-col rounded-lg shadow-xl"
			onclick={(e) => e.stopPropagation()}
		>
			{#if !imageLoaded}
				<div
					id="skeletonFullPic"
					class="absolute inset-0 z-[1000] h-full w-full animate-pulse bg-slate-600"
				></div>
			{/if}
			{#if img}
				{#await getImgProxyURL(img.path, img.width / 3, img.height / 3) then response}
					<img
						bind:this={imgElement}
						id="fullpic-{img.id}"
						src={response}
						alt={img.fileName}
						class="relative h-fit max-h-full min-h-[600px] w-fit max-w-full"
						loading="eager"
						height="{img.height}px"
						width="{img.width}px"
						onload={() => {
							awaitImageRender(async () => {
								await tick();
								imageLoaded = true;
								let dateDisplay = document.getElementById('dateDisplay');
								let width = `${imgElement?.width}px`;
								if (dateDisplay) {
									dateDisplay.style.width = width;
									dateDisplay.classList.remove('invisible');
								}
							});
						}}
					/>
				{/await}
				<div
					bind:this={dateDisplay}
					id="dateDisplay"
					class="invisible flex-none rounded-b-md bg-gray-900 p-2 py-1 text-3xl text-white"
				>
					{formattedDate(img.createdOn)}
				</div>
			{/if}
		</div>
	</button>
{/if}

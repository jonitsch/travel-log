<script lang="ts">
	import type { Image } from '$gen/prisma/client/client';
	import { global } from '$lib/state.svelte';
	import { getImgProxyURL } from '../imgproxy';
	import ErrorMessage from './ErrorMessage.svelte';
	import ImageCard from './ImageCard.svelte';
	import Modal from './Modal.svelte';

	let open = $state(false),
		images = $state<Image[]>([]);

	export function openModal() {
		open = true;
	}
</script>

<Modal bind:open>
	{#if global.journeyData?.image.length}
		{#each images as img}
			{#await getImgProxyURL(img.path, img.width * 0.15, img.height * 0.15) then response}
				<ImageCard {img} src={response} />
			{:catch error}
				<ErrorMessage {error}>Image Failed To Load!</ErrorMessage>
			{/await}
		{/each}
	{/if}
</Modal>

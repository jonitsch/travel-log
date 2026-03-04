<script lang="ts">
	import type { Image } from '$gen/prisma/client/client';
	import { global } from '$lib/state.svelte';
	import { getImgProxyURL } from '../../imgproxy';
	import ErrorMessage from '../ErrorMessage.svelte';
	import ImageCard from '../ImageCard.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import { Input } from '../shadcn/input';
	import SVGIcon from '../SVGIcon.svelte';

	let open = $state(true),
		files = $state<FileList>(),
		images = $state<string[]>([]);

	$effect(() => {
		if (files?.length) {
			images = Array.from(files).map((file) => {
				return URL.createObjectURL(file);
			});
		} else {
			images = []
		}
	});

	export function openModal() {
		open = true;
	}

	$inspect(files);
</script>

<Modal bind:open>
	<form
		id="addImageForm"
		action="?/addImage"
		method="POST"
		enctype="multipart/form-data"
		class="flex h-fit flex-col items-center justify-center gap-5 rounded-md bg-slate-900 py-10 px-5 border-3 border-gray-950"
	>
		<div class="flex flex-row items-center gap-1">
			<span class="text-4xl">Add Images</span>
			<SVGIcon type="addImage" fill="white" scale={2.5} hoverScale={false} />
		</div>
		<div class="flex flex-row gap-2">
			<Input
				name="files"
				type="file"
				class="w-sm cursor-pointer hover:ring-2 hover:ring-white"
				accept="image/*"
				multiple
				bind:files
			/>
			<Button type="submit" class="bg-green-600" disabled={!images?.length}>Upload</Button>
			<Button type="submit" disabled={images?.length > 0}>Cancel</Button>
		</div>

		{#if images?.length}
			<div class="flex flex-row gap-2 overflow-x-hidden pr-3">
				{#each images as src}
					<img
						class="size-25 cursor-pointer rounded-md object-cover transition duration-100 ease-in-out"
						{src}
						alt=""
					/>
				{/each}
			</div>
		{/if}

		<input type="hidden" value={global.journeyId} name="journeyId" />
	</form>
</Modal>

<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import { Input } from '../shadcn/input';
	import SVGIcon from '../SVGIcon.svelte';

	let open = $state(true),
		value = $state(),
		files = $state<FileList>(),
		images = $state<string[]>([]);

	$effect(() => {
		if (files?.length) {
			images = Array.from(files).map((file) => {
				return URL.createObjectURL(file);
			});
		} else {
			images = [];
		}
	});

	export function openModal() {
		open = true;
	}
	function reset() {
		images = [];
		value = null;
	}

	$inspect(files);
</script>

<Modal bind:open>
	<form
		id="addImageForm"
		action="?/addImage"
		method="POST"
		enctype="multipart/form-data"
		class="flex h-fit flex-col items-center justify-center gap-5 rounded-md border-b-3 border-b-gray-950 bg-slate-900/90 p-5"
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
				bind:value
			/>
			<Button type="submit" class="bg-green-600" disabled={!images?.length}>Upload</Button>
			<Button type="button" onclick={() => reset()} disabled={!(images?.length > 0)}>Cancel</Button>
		</div>

		<div class="grid grid-cols-5 justify-center gap-2">
			{#each images as src, i}
				{#if i < 9}
					<img
						class="size-25 rounded-md object-cover transition duration-100 ease-in-out"
						{src}
						alt="File Upload Preview Image #{i + 1}"
					/>
				{/if}
			{:else}
				{#each { length: 5 }}
					<div class="placeholder"></div>
				{/each}
			{/each}
			{#if images.length > 9}
				<div class="placeholder text-2xl">...{images.length - 9}</div>
			{/if}
		</div>

		<input type="hidden" value={global.journeyId} name="journeyId" />
	</form>
</Modal>

<style>
	.placeholder {
		display: flex;
		background-color: #45556c;
		width: 100px;
		height: 100px;
		border-radius: calc(var(--radius) /* 0.25rem = 4px */ - 2px);
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>

<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import { Input } from '../shadcn/input';
	import SVGIcon from '../SVGIcon.svelte';

	let open = $state(false),
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
</script>

<Modal bind:open>
	<div class="relative">
		<button
			type="button"
			class="absolute z-99 top-1 right-1 flex size-8 items-center justify-center rounded-full p-2 text-white/70 hover:bg-white/10"
			onclick={() => (open = false)}
			aria-label="Close modal"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
				<line
					x1="4"
					y1="4"
					x2="20"
					y2="20"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
				<line
					x1="20"
					y1="4"
					x2="4"
					y2="20"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
		</button>
		<form
			id="addImageForm"
			action="?/addImage"
			method="POST"
			enctype="multipart/form-data"
			class="flex h-fit flex-col items-center justify-center gap-5 rounded-md border-b-3 border-b-gray-950 bg-slate-900 p-5 opacity-70"
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
				<Button type="button" onclick={() => reset()} disabled={!images?.length}>Cancel</Button>
			</div>

			<div
				class="flex flex-row items-center justify-center gap-2"
			>
				{#each images as src, i}
					{#if i < 4}
						<img
							class="preview rounded-md object-cover"
							{src}
							alt="File Upload Preview Image #{i + 1}"
						/>
					{/if}
				{:else}
					{#each { length: 4 }}
						<div class="preview placeholder"></div>
					{/each}
				{/each}
				{#if images.length > 4}
					<div class="preview placeholder text-2xl">+{images.length - 4}</div>
				{/if}
			</div>

			<input type="hidden" value={global.journeyId} name="journeyId" />
		</form>
	</div>
</Modal>

<style>
	.preview {
		width: 15dvw;
		height: 15dvw;
	}
	.placeholder {
		display: flex;
		background-color: #45556c;
		border-radius: calc(var(--radius) /* 0.25rem = 4px */ - 2px);
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>

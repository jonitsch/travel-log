<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import { Input } from '../shadcn/input';
	import SVGIcon from '../SVGIcon.svelte';
	import { filesProxy, superForm, type SuperValidated } from 'sveltekit-superforms';
	import z from 'zod';
	import { switchToJourney } from '$lib/utils/client';

	let {
		addImageForm
	}: {
		addImageForm: SuperValidated<
			{
				journeyId: string;
				files: z.core.File[];
			},
			any,
			{
				journeyId: string;
				files: z.core.File[];
			}
		>;
	} = $props();

	let open = $state(false),
		images = $state<string[]>([]);

	const { form, errors, enhance } = superForm(addImageForm);

	const files = filesProxy(form, 'files');

	$effect(() => {
		if (!$files?.length) {
			images = [];
			return;
		}

		const urls = Array.from($files).map(URL.createObjectURL);
		images = urls;

		return () => {
			urls.forEach(URL.revokeObjectURL);
		};
	});

	export function openModal() {
		reset();
		open = true;
	}
	function reset() {
		images = [];
		$form.files = [];
		$errors.journeyId = [];
		$errors.files = {};
	}
</script>

<Modal bind:open onclose={reset}>
	<div class="relative">
		<button
			type="button"
			class="absolute top-1 right-1 z-99 flex size-8 items-center justify-center rounded-full p-2 text-white/70 hover:bg-white/10"
			onclick={() => (open = false)}
			aria-label="Close modal"
		>
			<SVGIcon type="x" color="white" scale={0.8} />
		</button>
		<form
			id="addImageForm"
			action="?/addImage"
			method="POST"
			enctype="multipart/form-data"
			class="flex h-fit flex-col items-center justify-center gap-5 rounded-md border-b-3 border-b-gray-950 bg-slate-900 p-5 opacity-70"
			use:enhance={{
				onResult: ({ result }) => {
					console.log(result)
					reset();
					if (result.type === 'success' && result.data?.journeyId) {
						global.loadingJourney = true;
						switchToJourney(result.data.journeyId);
						open = false;
					}
					open = false;
				}
			}}
		>
			<div class="flex flex-row items-center gap-1">
				<span class="text-4xl">Add Images</span>
				<SVGIcon type="addImage" color="white" scale={2.5} hoverScale={false} />
			</div>
			<div class="flex flex-row gap-2">
				<div class="flex flex-col gap-1">
					<Input
						name="files"
						type="file"
						class="w-sm cursor-pointer hover:ring-2 hover:ring-white"
						accept="image/*"
						aria-invalid={$errors.files ? 'true' : undefined}
						multiple
						oninput={(e) => ($form.files = Array.from(e.currentTarget.files ?? []))}
					/>
					{#if $errors.files}
						<small class="text-red-600" role="alert">{$errors.files[0]}</small>
					{:else}
						<small class="invisible">Invisible Error Placeholder</small>
					{/if}
				</div>

				<Button type="submit" class="bg-green-600" disabled={images.length === 0}>Upload</Button>
				<Button type="button" onclick={() => open = false}>Cancel</Button>
			</div>

			<div class="flex flex-row items-center justify-center gap-2">
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

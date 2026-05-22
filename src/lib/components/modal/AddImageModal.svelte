<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import { Input } from '../shadcn/input';
	import SVGIcon from '../SVGIcon.svelte';
	import { filesProxy, superForm, type SuperValidated } from 'sveltekit-superforms';
	import z from 'zod';
	import { switchToJourney } from '$lib/utils/client';
	import { invalidateAll } from '$app/navigation';
	import ModalBody from './ModalBody.svelte';

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

	const { form, errors, message, enhance } = $derived.by(() => superForm(addImageForm));

	const files = $derived.by(() => filesProxy(form, 'files'));

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
	<ModalBody bind:open>
		<form
			id="addImageForm"
			action="?/addImage"
			method="POST"
			enctype="multipart/form-data"
			class="flex h-fit flex-col items-center justify-center gap-5 max-w-[80dvw]"
			use:enhance={{
				onResult: async ({ result }) => {
					if (result.type === 'success' && result.data?.journeyId) {
						await invalidateAll();
						reset();
						global.loadingJourney = true;
						const data = await switchToJourney(result.data.journeyId);
						global.journeyData = data;
						open = false;
					}
				}
			}}
		>
			<div class="flex flex-row items-center gap-1">
				<span class="text-4xl">Add Images</span>
				<SVGIcon type="addImage" color="white" scale={2.5} hoverScale={false} />
			</div>
			<div class="flex w-full flex-row gap-2">
				<div class="flex w-auto flex-1 flex-row gap-1">
					<Input
						name="files"
						type="file"
						class="min-w-25 cursor-pointer hover:ring-2 hover:ring-white"
						accept="image/*"
						aria-invalid={$errors.files ? 'true' : undefined}
						multiple
						oninput={(e) => ($form.files = Array.from(e.currentTarget.files ?? []))}
					/>
					{#each $errors.files?._errors as error}
						<small class="text-red-500">{error}</small>
					{/each}
				</div>

				<Button type="submit" class="bg-green-600" disabled={images.length === 0}>Upload</Button>
				<Button type="button" onclick={() => (open = false)}>Cancel</Button>
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
			{#if $message}
				<small class="text-red-600">{$message}</small>
			{/if}
		</form>
	</ModalBody>
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

<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import { Input } from '../shadcn/input';
	import { filesProxy, superForm, type SuperValidated } from 'sveltekit-superforms';
	import z from 'zod';
	import { switchToJourney, toastFailure, toastSuccess } from '$lib/utils/client';
	import { invalidateAll } from '$app/navigation';
	import ModalBody from './ModalBody.svelte';
	import FormButton from '../form/FormButton.svelte';
	import { fade } from 'svelte/transition';

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

	const { form } = $derived.by(() => superForm(addImageForm));

	const files = $derived.by(() => filesProxy(form, 'files'));

	let open = $state(false),
		images = $state<string[]>([]),
		uploading = $state(false),
		total = $derived($files.length),
		progress = $state(0);

	export function openModal() {
		reset();
		open = true;
	}
	function reset() {
		images = [];
		$form.files = [];
		uploading = false;
		total = 0;
		progress = 0;
	}

	async function uploadImages() {
		if (!$files?.length) return;

		open = true;
		global.loadingJourney = true;

		const journeyId = global.journeyId;
		if (!journeyId) throw Error('Missing journey id!');

		try {
			uploading = true;

			const uploads = $form.files.map(async (file) => {
				const fd = new FormData();

				fd.append('file', file);
				fd.append('journeyId', journeyId);

				const res = await fetch(`/api/images?method=upload`, {
					method: 'POST',
					body: fd
				});

				const payload = await res.json().catch(() => null);
				if (!res.ok || !payload?.ok) {
					throw new Error(payload?.error || `Upload failed (${res.status})`);
				}

				toastSuccess('Image uploaded successfully!');

				progress += 1;
				return payload;
			});

			await Promise.all(uploads);
		} catch (err) {
			toastFailure('Something went wrong!');
			console.error('Upload failed:', err);
		} finally {
			await invalidateAll();
			global.journeyData = await switchToJourney(journeyId);
			uploading = false;
			open = false;
			reset();
		}
	}

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
</script>

<Modal bind:open onclose={reset}>
	<ModalBody bind:open title="Add Images" icon="addImage">
		<div class="flex w-full flex-row items-center gap-2">
			{#if !uploading}
				<div class="flex w-auto flex-1 flex-row gap-1">
					<Input
						name="files"
						type="file"
						class="min-w-25 cursor-pointer hover:ring-2 hover:ring-white"
						accept="image/*"
						multiple
						oninput={(e) => ($form.files = Array.from(e.currentTarget.files ?? []))}
					/>
				</div>

				<FormButton
					variant="confirm"
					type="button"
					onclick={uploadImages}
					disabled={images.length === 0}
					label="Upload"
				/>
				<FormButton variant="cancel" type="button" onclick={() => (open = false)} label="Cancel" />
			{:else}
				<div class="h-5 w-full overflow-hidden rounded bg-gray-700" transition:fade>
					<div
						class="h-full bg-green-500 transition-all duration-300"
						style="width: {total ? (progress / total) * 100 : 0}%"
					></div>
				</div>

				<div class="w-fit text-sm whitespace-nowrap text-white">
					{progress} / {total}
				</div>
			{/if}
		</div>

		<div class="flex min-h-full min-w-full flex-row items-center justify-center gap-2 *:flex-1">
			{#each images as src, i}
				{#if i < 3}
					<img
						class="preview max-w-[15dvw] rounded-md object-cover"
						{src}
						alt="File Upload Preview Image #{i + 1}"
					/>
				{/if}
			{:else}
				{#each { length: 4 }}
					<div class="preview placeholder"></div>
				{/each}
			{/each}
			{#if images.length > 3}
				<div class="preview placeholder sm:text-2xl">+{images.length - 3}</div>
			{/if}
		</div>

		<input type="hidden" value={global.journeyId} name="journeyId" />
	</ModalBody>
</Modal>

<style>
	.preview {
		min-width: 15dvw;
		max-width: 15dvw;
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

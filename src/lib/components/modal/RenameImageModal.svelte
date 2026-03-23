<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import SVGIcon from '../SVGIcon.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { switchToJourney } from '$lib/utils/client';
	import type { Image } from '$gen/prisma/client/client';
	import Input from '../shadcn/input/input.svelte';

	let {
		renameImageForm
	}: {
		renameImageForm: SuperValidated<
			{
				imgId: string;
				newName: string;
			},
			any,
			{
				imgId: string;
				newName: string;
			}
		>;
	} = $props();

	let open = $state(false),
		img = $state<Image>(),
		newName = $state<string>();

	const { form, errors, message, enhance } = superForm(renameImageForm);

	export function openModal(inputImg: Image) {
		reset();
		img = inputImg;
		newName = img.fileName;
		open = true;
	}
	function reset() {
		img = undefined;
		$form.imgId = '';
		$form.newName = '';
		$errors.imgId = [];
		$errors.newName = [];
	}
</script>

<Modal bind:open onclose={reset}>
	{#if img}
		<div
			class="relative flex w-xl flex-col gap-5 rounded-md border-b-3 border-b-gray-950 bg-slate-900 p-5 opacity-70"
		>
			<button
				type="button"
				class="absolute top-1 right-1 z-99 flex size-8 items-center justify-center rounded-full p-2 text-white/70 hover:bg-white/10"
				onclick={() => (open = false)}
				aria-label="Close modal"
			>
				<SVGIcon type="x" color="white" scale={0.8} />
			</button>
			<div class="flex h-fit flex-col items-center">
				<SVGIcon type="rename" color="white" scale={2.5} hoverScale={false} />
				<span class="text-4xl">Rename Image</span>
			</div>
			<form
				id="renameImageForm"
				action="?/renameImage"
				method="POST"
				class="flex h-fit flex-row items-center justify-center gap-2"
				use:enhance={{
					onResult: async ({ result }) => {
						global.selectedImageIds = [];
						if (result.type === 'success' && result.data?.journeyId) {
							global.loadingJourney = true;
							switchToJourney(result.data.journeyId);
							open = false;
						}
					}
				}}
			>
				<Input class="text-center" type="text" bind:value={newName} name="newName" />
				<Button type="submit" class="bg-green-600" disabled={img.fileName === newName}
					>Confirm</Button
				>
				<Button type="button" onclick={() => (open = false)}>Cancel</Button>
				{#if $errors.imgId}
					<small class="text-red-600" role="alert">{$errors.imgId[0]}</small>
				{/if}
				<input type="hidden" value={img.id} name="imgId" />
			</form>
			{#if $message}
				<small class="text-red-600">{$message}</small>
			{/if}
		</div>
	{/if}
</Modal>

<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import SVGIcon from '../SVGIcon.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { switchToJourney } from '$lib/utils/client';

	let {
		deleteImageForm
	}: {
		deleteImageForm: SuperValidated<
			{
				journeyId: string;
				imgIds: string[];
			},
			any,
			{
				journeyId: string;
				imgIds: string[];
			}
		>;
	} = $props();

	let open = $state(false),
		images = $state<string[]>([]);

	const { form, errors, message, enhance } = superForm(deleteImageForm);

	export function openModal() {
		reset();
		open = true;
		$form.imgIds = global.selectedImageIds;
	}
	function reset() {
		images = [];
		$form.journeyId = '';
		$form.imgIds = [];
		$errors.journeyId = [];
		$errors.imgIds = {};
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
			id="deleteImageForm"
			action="?/deleteImage"
			method="POST"
			enctype="multipart/form-data"
			class="flex h-fit flex-col items-center justify-center gap-5 rounded-md border-b-3 border-b-gray-950 bg-slate-900 p-5 opacity-70"
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
			<div class="flex flex-col items-center gap-1">
				<SVGIcon type="delete" color="white" scale={2.5} hoverScale={false} />
				<span class="text-4xl">Delete Image{$form.imgIds.length === 1 ? '' : 's'}?</span>
			</div>
			<div class="flex flex-row gap-2">
				<Button type="submit" class="bg-green-600" disabled={$form.imgIds.length === 0}
					>Confirm</Button
				>
				<Button type="button" onclick={() => (open = false)}>Cancel</Button>
			</div>
			{#if $errors.imgIds}
				<small class="text-red-600" role="alert">{$errors.imgIds[0]}</small>
			{/if}

			<input type="hidden" value={global.journeyId} name="journeyId" />
			{#each $form.imgIds as id, i}
				<input type="hidden" bind:value={$form.imgIds[i]} name="imgIds" />
			{/each}
			{#if $message}
				<small class="text-red-600">{$message}</small>
			{/if}
		</form>
	</div>
</Modal>

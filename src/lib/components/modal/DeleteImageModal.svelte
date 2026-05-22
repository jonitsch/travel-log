<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import SVGIcon from '../utility/SVGIcon.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { switchToJourney } from '$lib/utils/client';
	import { invalidateAll } from '$app/navigation';
	import ModalBody from './ModalBody.svelte';

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

	const { form, errors, message, enhance } = $derived.by(() => superForm(deleteImageForm));

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
		$message = '';
	}
</script>

<Modal bind:open onclose={reset}>
	<ModalBody bind:open>
		<form
			id="deleteImageForm"
			action="?/deleteImage"
			method="POST"
			enctype="multipart/form-data"
			class="flex h-fit flex-col items-center justify-center gap-5"
			use:enhance={{
				onResult: async ({ result }) => {
					global.selectedImageIds = [];
					if (result.type === 'success' && result.data?.journeyId) {
						await invalidateAll();
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
			<div class="flex w-full flex-row gap-2 *:flex-1">
				<Button type="submit" class="bg-green-600" disabled={$form.imgIds.length === 0}
					>Confirm</Button
				>
				<Button type="button" onclick={() => (open = false)}>Cancel</Button>
			</div>
			{#if $errors.imgIds?._errors}
				<small class="text-red-600" role="alert">{$errors.imgIds}</small>
			{/if}

			<input type="hidden" value={global.journeyId} name="journeyId" />
			{#each $form.imgIds as _, i}
				<input type="hidden" bind:value={$form.imgIds[i]} name="imgIds" />
			{/each}
		</form>
		{#if $message}
			<small class="mt-1 flex w-full justify-center text-red-600">{$message}</small>
		{/if}
	</ModalBody>
</Modal>

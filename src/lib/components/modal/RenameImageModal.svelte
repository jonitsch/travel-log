<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import SVGIcon from '../utility/SVGIcon.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { switchToJourney } from '$lib/utils/client';
	import type { Image } from '$gen/prisma/client/client';
	import Input from '../shadcn/input/input.svelte';
	import ModalBody from './ModalBody.svelte';

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

	const { form, errors, message, enhance } = $derived.by(() => superForm(renameImageForm));

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
		$message = undefined;
	}
</script>

<Modal bind:open onclose={reset}>
	{#if img}
		<ModalBody bind:open title="Rename Image" icon="rename">
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
				<small class="mt-1 flex w-full justify-center text-red-600">{$message}</small>
			{/if}
		</ModalBody>
	{/if}
</Modal>

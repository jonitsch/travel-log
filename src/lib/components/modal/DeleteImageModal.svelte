<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { switchToJourney, toastFailure, toastSuccess } from '$lib/utils/client';
	import { invalidateAll } from '$app/navigation';
	import ModalBody from './ModalBody.svelte';
	import FormButton from '../form/FormButton.svelte';
	import { ClientApiError, requestApi } from '$lib/api/client';

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

	let imgIds = $derived(global.selectedImageIds),
		open = $state(false),
		deleting = $state(false);

	const { form } = $derived.by(() => superForm(deleteImageForm));

	export function openModal() {
		open = true;
	}
	function reset() {
		$form.journeyId = '';
		deleting = false;
	}

	async function deleteImages() {
		open = true;
		global.loadingJourney = true;

		const journeyId = global.journeyId;
		if (!journeyId) throw Error('Missing journey id!');

		try {
			deleting = true;

			const deletions = imgIds.map(async (id) => {
				const fd = new FormData();

				fd.append('id', id);
				fd.append('journeyId', journeyId);

				const payload = await requestApi<{ id: string; key: string; journeyId: string }>(
					`/api/images?method=delete`,
					{
						method: 'POST',
						body: fd
					},
					{ fallbackError: 'Image deletion failed.' }
				);

				toastSuccess(`Image deleted successfully!`);

				return payload;
			});

			await Promise.all(deletions);
		} catch (err) {
			const message = err instanceof ClientApiError ? err.message : 'Something went wrong!';
			toastFailure(message);
			console.error('Delete failed:', err);
		} finally {
			await invalidateAll();
			global.journeyData = await switchToJourney(journeyId);
			deleting = false;
			open = false;
			reset();
		}
	}
</script>

<Modal bind:open onclose={reset}>
	<ModalBody
		bind:open
		title={`Delete Image${imgIds.length === 1 ? '' : `s (${imgIds.length})`}?`}
		icon="delete"
		alignment="col"
	>
		<div class="flex w-full flex-row gap-2 *:flex-1">
			<FormButton
				variant="confirm"
				type="button"
				onclick={deleteImages}
				disabled={imgIds.length === 0 || deleting}
				loading={deleting}
				label="Confirm"
			/>
			<FormButton variant="cancel" type="button" onclick={() => (open = false)} disabled={deleting} label="Cancel" />
		</div>
	</ModalBody>
</Modal>

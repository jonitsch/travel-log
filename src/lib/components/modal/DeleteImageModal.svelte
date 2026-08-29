<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { Button } from '../shadcn/button';
	import SVGIcon from '../utility/SVGIcon.svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import { switchToJourney, toastFailure, toastSuccess } from '$lib/utils/client';
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

				const res = await fetch('/api/images/delete', {
					method: 'POST',
					body: fd
				});

				if (!res.ok) {
					const errorText = await res.text();
					throw new Error(errorText || `Delete failed (${res.status})`);
				}

				toastSuccess(`Image deleted successfully!`);

				return res.json();
			});

			await Promise.all(deletions);
		} catch (err) {
			toastFailure('Something went wrong!');
			console.error('Upload failed:', err);
		} finally {
			await invalidateAll();
			global.journeyData = await switchToJourney(journeyId);
			deleting = false;
			open = false;
			reset();
			global.selectedImageIds = [];
		}
	}
</script>

<Modal bind:open onclose={reset}>
	<ModalBody
		bind:open
		title={`Delete Image${imgIds.length === 1 ? '' : `s (${imgIds.length})`}?`}
		icon="delete"
		alignment ="col"
	>
		<div class="flex w-full flex-row gap-2 *:flex-1">
			<Button
				type="button"
				onclick={deleteImages}
				class="bg-green-600"
				disabled={imgIds.length === 0 || deleting}
				>{#if deleting}
					<SVGIcon type="spinner" fill="none" />
				{:else}
					Confirm
				{/if}
			</Button>
			<Button type="button" onclick={() => (open = false)} disabled={deleting}>Cancel</Button>
		</div>
	</ModalBody>
</Modal>

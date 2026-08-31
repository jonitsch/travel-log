<script lang="ts">
	import { global } from '$lib/state.svelte';
	import Modal from './Modal.svelte';
	import { switchToJourney, toastFailure, toastSuccess } from '$lib/utils/client';
	import type { Image } from '$gen/prisma/client/client';
	import Input from '../shadcn/input/input.svelte';
	import ModalBody from './ModalBody.svelte';
	import FormButton from '../form/FormButton.svelte';

	let open = $state(false),
		img = $state<Image>(),
		newName = $state<string>(),
		saving = $state(false),
		errorMessage = $state<string>('');

	export function openModal(inputImg: Image) {
		reset();
		img = inputImg;
		newName = img.fileName;
		open = true;
	}
	function reset() {
		img = undefined;
		newName = undefined;
		errorMessage = '';
		saving = false;
	}

	async function renameImage() {
		if (!img || !newName) return;
		saving = true;
		errorMessage = '';

		try {
			const fd = new FormData();
			fd.append('imgId', img.id);
			fd.append('newName', newName);

			const res = await fetch(`/api/images?method=rename`, {
				method: 'POST',
				body: fd
			});

			const payload = await res.json().catch(() => null);
			if (!res.ok || !payload?.ok) {
				throw new Error(payload?.error || `Rename failed (${res.status})`);
			}

			global.selectedImageIds = [];
			toastSuccess('Image renamed successfully!');
			global.loadingJourney = true;
			await switchToJourney(payload.journeyId);
			open = false;
		} catch (err) {
			console.error(err);
			errorMessage = err instanceof Error ? err.message : 'Something went wrong!';
			toastFailure(errorMessage || 'Something went wrong!');
		} finally {
			saving = false;
		}
	}
</script>

<Modal bind:open onclose={reset}>
	{#if img}
		<ModalBody bind:open title="Rename Image" icon="rename" alignment="col">
			<div class="flex h-fit flex-row items-center justify-center gap-2">
				<Input class="text-center" type="text" bind:value={newName} name="newName" />
				<FormButton
					variant="confirm"
					type="button"
					onclick={renameImage}
					disabled={img.fileName === newName || saving}
					loading={saving}
					label="Confirm"
				/>
				<FormButton
					variant="cancel"
					type="button"
					onclick={() => (open = false)}
					disabled={saving}
					label="Cancel"
				/>
			</div>
			{#if errorMessage}
				<small class="mt-1 flex w-full justify-center text-red-600">{errorMessage}</small>
			{/if}
		</ModalBody>
	{/if}
</Modal>

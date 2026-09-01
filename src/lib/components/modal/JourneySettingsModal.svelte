<script lang="ts">
	import Modal from './Modal.svelte';
	import ModalBody from './ModalBody.svelte';
	import { global } from '$lib/state.svelte';
	import { ClientApiError, requestApi } from '$lib/api/client';
	import { switchToJourney, switchToOverview, toastFailure, toastSuccess } from '$lib/utils/client';
	import { toast } from '@zerodevx/svelte-toast';
	import JourneyColorGrid from '../utility/JourneyColorGrid.svelte';
	import { invalidateAll, refreshAll } from '$app/navigation';
	import FormButton from '../form/FormButton.svelte';
	import Input from '../shadcn/input/input.svelte';

	let open = $state(false);
	let name = $state('');
	let color = $state('');
	let deleteConfirmation = $state('');
	let isSaving = $state(false);
	let isDeleting = $state(false);

	export function openModal() {
		const journey = global.journeyData;
		if (!journey) return;

		name = journey.name;
		color = journey.color;
		deleteConfirmation = '';
		open = true;
	}

	function reset() {
		name = '';
		color = '';
		deleteConfirmation = '';
	}

	async function handleSave() {
		const journeyId = global.journeyId;
		const journey = global.journeyData;
		if (!journeyId || !journey) return;

		const trimmedName = name.trim();
		const requests: Promise<unknown>[] = [];

		if (trimmedName && trimmedName !== journey.name) {
			const formData = new FormData();
			formData.append('journeyId', journeyId);
			formData.append('name', trimmedName);
			requests.push(
				requestApi(`/api/journeys?method=rename`, {
					method: 'POST',
					body: formData
				})
			);
		}

		if (color && color !== journey.color) {
			const formData = new FormData();
			formData.append('journeyId', journeyId);
			formData.append('color', color);
			requests.push(
				requestApi(`/api/journeys?method=recolor`, {
					method: 'POST',
					body: formData
				})
			);
		}

		if (!requests.length) {
			open = false;
			reset();
			return;
		}

		isSaving = true;
		try {
			await Promise.all(requests);
			await switchToJourney(journeyId);

			toastSuccess('Journey updated!');
		} catch (error) {
			const message = error instanceof ClientApiError ? error.message : 'Failed to update journey';
			toastFailure(message);
		} finally {
			isSaving = false;
			open = false;
			invalidateAll();
			reset();
		}
	}

	async function handleDelete() {
		const journey = global.journeyData;
		if (!journey) return;
		if (deleteConfirmation.trim() !== journey.name) {
			toast.push('Type the journey name to confirm deletion.', {
				theme: { '--toastColor': '#fbbf24' }
			});
			return;
		}

		isDeleting = true;
		try {
			const formData = new FormData();
			formData.append('journeyId', journey.journeyId);
			await requestApi(`/api/journeys?method=delete`, {
				method: 'POST',
				body: formData
			});

			invalidateAll();
			switchToOverview();
			refreshAll();

			toastSuccess(`Deleted journey "${journey.name}"!`);
			open = false;
			reset();
		} catch (error) {
			const message = error instanceof ClientApiError ? error.message : 'Failed to delete journey';
			toastFailure(message);
		} finally {
			isDeleting = false;
		}
	}
</script>

<Modal bind:open onclose={reset}>
	<ModalBody
		bind:open
		title="Journey Settings"
		icon="settingsLarge"
		alignment="col"
		iconScale={2.55}
	>
		<div class="flex w-[min(26rem,80vw)] flex-col gap-5 text-white">
			<label class="flex flex-col gap-2">
				<span class="text-xl">Name</span>
				<Input bind:value={name} type="text" maxlength={40} placeholder="Journey name..." />
			</label>

			<div class="flex flex-col gap-2">
				<span class="text-xl">Color</span>
				<JourneyColorGrid bind:color />
			</div>

			<div class="rounded-md border border-red-500/40 bg-red-500/5 p-3">
				<label class="flex flex-col gap-2">
					<span class="text-xl text-red-200">Delete journey</span>
					<Input
						bind:value={deleteConfirmation}
						type="text"
						placeholder={`Type "${global.journeyData?.name ?? 'Journey name'}" to delete`}
						class="rounded-md border border-red-500/60 px-3 py-2 text-white transition"
					/>
				</label>
			</div>

			<div class="flex justify-end gap-2">
				<FormButton variant="cancel" onclick={() => (open = false)} />
				<FormButton
					variant="confirm"
					label="Save"
					disabled={isSaving || isDeleting || !name.trim()}
					onclick={handleSave}
					loading={isSaving}
				/>
				<FormButton
					variant="delete"
					disabled={isSaving ||
						isDeleting ||
						deleteConfirmation.trim() !== (global.journeyData?.name ?? '')}
					onclick={handleDelete}
					loading={isDeleting}
				/>
			</div>
		</div>
	</ModalBody>
</Modal>

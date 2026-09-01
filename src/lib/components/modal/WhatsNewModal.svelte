<script lang="ts">
	import Modal from './Modal.svelte';
	import ModalBody from './ModalBody.svelte';

	let open = $state(false);

	export function openModal() {
		open = true;
	}

	const sections = [
		{
			title: 'New Features',
			items: [
				'Added Journey Settings to rename, recolor and delete journeys',
				'Enter Image Selection Mode by holding CTRL on your keyboard!',
				'Upload counters and clearer loading feedback while media is being added.'
			]
		},
		{
			title: 'Improvements',
			items: [
				'Refined modal spacing, image previews, and header messaging for a cleaner experience.',
				'More consistent app feedback when creating, editing, and deleting journey-related content.'
			]
		}
	];
</script>

<Modal bind:open>
	<ModalBody bind:open title="What's New?" icon="lightBulb" iconScale={2.05}>
		{#snippet subHeader()}
			A quick look at the latest features and improvements.
		{/snippet}
		<div class="flex w-[min(42rem,82vw)] flex-col gap-4 whitespace-normal text-white">
			{#each sections as section}
				<div class="w-full rounded-md border border-slate-700 bg-slate-950/60 p-4">
					<h3 class="mb-3 text-lg font-semibold text-teal-300">{section.title}</h3>
					<ul class="list-disc space-y-2 pl-5 text-sm text-slate-200">
						{#each section.items as item}
							<li>{item}</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</ModalBody>
</Modal>

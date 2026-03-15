<script lang="ts">
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$lib/utils/client';
	import FullImageModal from '$lib/components/modal/FullImageModal.svelte';
	import ImageCard from '$lib/components/ImageCard.svelte';
	import { formattedDate } from '$lib/utils/client';
	import SVGIcon from '$lib/components/SVGIcon.svelte';

	let book = $state<HTMLDivElement>(),
		fullImageModal = $state<FullImageModal>();

	// svelte-ignore non_reactive_update
	let previousDate: string | null = null;
	let dayOf = (date: Date) => {
		return date.toISOString().slice(0, 10);
	}; // DD//MM//YYYY
	let imgInputFiles = $state<FileList>();
</script>

<div
	id="book"
	class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 overflow-x-hidden pr-3"
	bind:this={book}
>
	{#if global.loadingJourney}
		<div class="skeleton col-span-full py-1 text-2xl text-transparent">Placeholder</div>
		{#each { length: 200 }}
			<div id="skeletonImage" class="skeleton" style="width: 1fr; height: 300px;"></div>
		{/each}
	{:else if global.journeyData}
		{@const images = global.journeyData.image}
		{(previousDate = null)}
		{#if images.length > 0}
			{#each images as img, i}
				{@const date = new Date(img.createdOn)}
				{#if previousDate != dayOf(date)}
					<div
						class={[
							'col-span-full h-fit w-full rounded-md border-b-2 border-black/60 bg-gray-900/70 px-3 py-1',
							{ 'mt-2': i != 0 }
						]}
					>
						<div class="text-2xl text-white">{formattedDate(date, 'dd/mm/yyyy')}</div>
					</div>
				{/if}
				<div class="col-span-1">
					{#await getImgProxyURL(img.id, img.width * 0.15, img.height * 0.15) then response}
						<ImageCard {img} src={response} {fullImageModal} />
					{:catch error}
						<ErrorMessage {error}>Image Failed To Load!</ErrorMessage>
					{/await}
				</div>
				<div hidden>{(previousDate = dayOf(date))}</div>
			{/each}
		{:else}
			<div
				class="col-span-full h-fit w-full rounded-md border-b-2 border-black/60 bg-gray-900/70 px-4 py-2 text-2xl text-white"
			>
				No images yet!
			</div>
			<div
				class="col-span-full flex h-75 flex-row items-center justify-center gap-3 rounded-md bg-slate-800 text-3xl"
			>
				Add your first images!
				<SVGIcon type="addImage" color="white" scale={2} hoverScale={false} />
			</div>
		{/if}
	{/if}
	<FullImageModal bind:this={fullImageModal} />
</div>

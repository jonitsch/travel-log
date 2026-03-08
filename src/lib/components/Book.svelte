<script lang="ts">
	import { global } from '$lib/state.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { getImgProxyURL } from '$lib/imgproxy';
	import FullImageModal from '$lib/components/modal/FullImageModal.svelte';
	import ImageCard from '$lib/components/ImageCard.svelte';
	import { formattedDate } from '$lib/utils/client';
	import SVGIcon from '$lib/components/SVGIcon.svelte';
	import Input from '$lib/components/shadcn/input/input.svelte';
	import AddImageModal from '$lib/components/modal/AddImageModal.svelte';
	import { Button } from '$lib/components/shadcn/button';
	import { onMount } from 'svelte';

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
		<div class="col-span-full skeleton py-1 text-2xl text-transparent">Placeholder</div>
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
					{#await getImgProxyURL(img.path, img.width * 0.15, img.height * 0.15) then response}
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
			<form
				id="addImageForm"
				action="?/addImage"
				method="POST"
				enctype="multipart/form-data"
				class="col-span-full flex h-75 flex-col items-center justify-center gap-5 rounded-md bg-slate-800 text-2xl"
			>
				<div class="flex flex-row items-center gap-1">
					Add your first images!
					<SVGIcon type="addImage" fill="white" scale={1.5} hoverScale={false} />
				</div>
				<div class="flex flex-row gap-2">
					<Input
						name="files"
						type="file"
						class="w-sm cursor-pointer hover:ring-2 hover:ring-white"
						bind:files={imgInputFiles}
						accept="image/*"
						multiple
					/>
					<Button type="submit" class="bg-green-600" disabled={!imgInputFiles?.length}
						>Upload</Button
					>
				</div>
				<input type="hidden" value={global.journeyId} name="journeyId" />
			</form>
		{/if}
	{:else}
		{@const error = new Error('Images failed to load - no image data received')}
		<ErrorMessage {error}>Failed To Load Image Data</ErrorMessage>
	{/if}
	<FullImageModal bind:this={fullImageModal} />
</div>

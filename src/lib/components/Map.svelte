<script lang="ts">
	import { Control, ControlButton, ControlGroup, MapLibre, Marker, Popup } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { global, type ViewMode } from '$lib/state.svelte';
	import { onMount, untrack } from 'svelte';
	import type { Data } from '$lib/server/database';

	interface Props {
		mapContainer: HTMLDivElement;
		data: Data;
		map: maplibregl.Map;
	}
	let { map = $bindable(), mapContainer = $bindable(), data = $bindable() }: Props = $props();

	let zoom: number = $state(1.5);
	let modal: CreateJourneyModal;
	let error = $state();

	async function getJourneyData(journeyId: string): Promise<any> {
		try {
			const res = await fetch(`/api/journeys?journeyId=${journeyId}`, {
				method: 'GET' // get Journey Data related to journeyId
			});
			global.journeyData = await res.json(); // save Journey Data to global.journeyData
			return global.journeyData;
		} catch (err) {
			error = err;
		}
	}

	// $inspect('global.journeyData',global.journeyData);
</script>

<CreateJourneyModal bind:this={modal} />

<MapLibre
	standardControls={false}
	bind:map
	style="https://tiles.openfreemap.org/styles/liberty"
	center={[13.388, 52.517]}
	bind:zoom
	onzoom={() => (zoom = zoom)}
	bind:mapContainer
	projection={{ type: 'globe' }}
	class="h-full max-h-full w-full rounded-md contain-inline-size sm:aspect-[19.43/9] sm:max-h-full"
	dragRotate={false}
	zoomOnDoubleClick={false}
	minZoom={1.5}
>
	{#if global.viewMode === 'overview'}
		{#each data.journeys as { lng, lat, name, journeyId, color }}
			<Marker
				lngLat={[lng, lat]}
				class={`h-3 w-3 place-items-center rounded-full ${color ?? global.journeyData?.color ?? 'bg-black'} focus:outline-2 focus:outline-black`}
			>
				<Popup
					anchor="bottom"
					offset={-15}
					open={true}
					closeOnClickOutside={false}
					closeButton={false}
				>
					<button
						class={`px-3 py-0.5 ${color ?? global.journeyData?.color ?? 'bg-black'} rounded-md text-white opacity-95`}
						onclick={() => {
							map.flyTo({ center: [lng, lat], zoom: 10.5, speed: 0.7 });
							global.journeyId = journeyId;
							global.viewMode = 'journey';
						}}
					>
						<text class="oxygen-regular">
							{name}
						</text>
					</button>
				</Popup>
			</Marker>
		{/each}
	{/if}
	<Control class="rounded-md bg-gray-900 p-3 text-white">
		<ControlButton onclick={() => map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 })}>
			{global.viewMode}
		</ControlButton>
	</Control>
	{#if global.viewMode === 'journey'}
		{#await getJourneyData(global.journeyId)}
			Loading Journey Data...
		{:then}
			{#if global.journeyData}
				{console.log($state.snapshot(global.journeyData))}
				{#each global.journeyData.marker as { name, journeyId, lng, lat, color }}
					<Marker
						lngLat={[lng, lat]}
						class={`h-3 w-3 place-items-center rounded-full ${color ?? global.journeyData.color ?? 'bg-black'} focus:outline-2 focus:outline-black`}
					>
						<Popup
							anchor="bottom"
							offset={-15}
							open={true}
							closeOnClickOutside={false}
							closeButton={false}
						>
							<button
								class={`px-3 py-0.5 ${color ?? global.journeyData.color ?? 'bg-black'} rounded-md text-white opacity-95`}
								onclick={() => {
									map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
									global.viewMode = 'overview';
									mapContainer.style = 'width: 100vw';
									global.journeyId = journeyId;
								}}
							>
								<text class="oxygen-regular">
									{name}
								</text>
							</button>
						</Popup>
					</Marker>
					{#if global.journeyData.image}
						{#each global.journeyData.image as { lng, lat, fileName }}
							{#if lng && lat}
								<Marker
									lngLat={[lat, lng]}
									class={`grid h-2 w-2 place-items-center rounded-full ${color} text-black shadow-2xl focus:outline-2 focus:outline-black`}
								/>
							{/if}
						{/each}
					{/if}
				{/each}
			{/if}
		{/await}
	{/if}
</MapLibre>

<!-- {:catch}
	<div
		class="z-1500000 absolute left-[50%] top-[50%] h-fit w-fit -translate-x-1/2 items-center rounded-md bg-red-950 p-3 text-center text-white"
	>
		<text class="oxygen-bold text-2xl">Failed to Load Map</text>
		<br />
		<text class="text-1xl oxygen-light">{error}</text>
	</div>
{/await} -->

<style>
	:global(.maplibregl-map) {
		font: inherit;
		margin-right: calc(100vw / 2) px;
	}
	:global(.maplibregl-popup-content) {
		background-color: transparent;
		border-radius: 15px;
		box-shadow: none;
		font-size: var(--text-1xl);
	}
	:global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
		border-top-color: transparent;
	}
	:global(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
		border-right-color: transparent;
	}
	:global(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
		border-left-color: transparent;
	}
	:global(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
		border-bottom-color: transparent;
	}
</style>

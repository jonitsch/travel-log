<script lang="ts">
	import { Control, ControlButton, ControlGroup, MapLibre, Marker, Popup } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { dolomites2025 } from '$lib/staticdata';
	import { refreshAll } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Props {
		mapContainer: HTMLDivElement;
		data: {
			paths: string[];
			markers: Promise<
				({
					journey: {
						color: string;
					};
				} & {
					id: number;
					color: string | null;
					name: string;
					lng: number;
					lat: number;
					journeyId: string;
					nextId: string | null;
				})[]
			>;
		};
		map: maplibregl.Map;
		onload: any;
		currentJourney: string;
	}
	let {
		map = $bindable(),
		mapContainer = $bindable(),
		data = $bindable(),
		onload = $bindable(),
		currentJourney = $bindable()
	}: Props = $props();

	let isLoading = $state(true);
	let zoom: number = $state(1.5);
	let modal: CreateJourneyModal;
	let enabled = $state(false);
	let markers: any = $state(data.markers ?? []);
	let error = $state();

	let mapJourneyId = $state('default');
	/* 	async function filterMarkers(mapJourneyId: string){
		markers = markers.filter((marker) => {
			return marker.journeyId == mapJourneyId ? true : false
		})
	} */

	async function updateMarkers(journeyId: string) {
		console.log(`updateMarkers(${journeyId})`);
		try {
			const response = await fetch(`/api/markers?journeyId=${journeyId}`, {
				method: 'GET'
			});
			markers = await response.json();
			refreshAll({ includeLoadFunctions: true });
			location.reload;
		} catch (err) {
			error = err;
			console.error(err);
		}
	}
</script>

<CreateJourneyModal bind:this={modal} />

{#if enabled}
	<button
		class="absolute top-[15px] left-[50%] z-[1500000] h-fit w-fit -translate-x-1/2 items-center rounded-md bg-emerald-900 p-3 text-2xl text-white"
		onclick={() => {
			markers = updateMarkers('default');
			map.flyTo({ center: [13.388, 52.517], zoom: 1.5 });
			enabled = false;
		}}
	>
		{currentJourney}
	</button>
{/if}

{#await updateMarkers('default')}
	Loading...
{:then showMap}
	<MapLibre
		onload={() => onload}
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
		<!--
 	<Control class="rounded-md bg-gray-900 p-3 text-white">
		<ControlButton>
			{zoom.toPrecision(3)}
		</ControlButton>
	</Control> 
-->
		{#each markers as { lng, lat, name, journeyId, journey, color, nextId }}
			<Marker
				lngLat={[lng, lat]}
				class={`grid h-4 w-4 place-items-center rounded-full ${color ?? journey.color ?? 'bg-black'} text-black shadow-2xl focus:outline-2 focus:outline-black`}
			>
				<Popup
					anchor="bottom"
					offset={-15}
					open={true}
					closeOnClickOutside={false}
					closeButton={false}
				>
					<button
						class={`px-3 py-1 ${color ?? journey.color ?? 'bg-black'} rounded-md text-white opacity-95`}
						onclick={() => {
							if (nextId == 'default') {
								map.flyTo({ center: [13.388, 52.517], zoom: 1.5 });
								enabled = false;
							} else {
								map.flyTo({ center: [lng, lat], zoom: 10.5 });
								enabled = true;
								currentJourney = name;
							}
							updateMarkers(nextId ?? journeyId);
						}}
					>
						<text class="oxygen-regular">
							{name}
						</text>
					</button>
				</Popup>
			</Marker>
		{/each}
	</MapLibre>
{:catch}
	<div
		class="absolute top-[50%] left-[50%] z-[1500000] h-fit w-fit -translate-x-1/2 items-center rounded-md bg-red-950 p-3 text-center text-white"
	>
		<text class="oxygen-bold text-2xl">Failed to Load Map</text>
		<br />
		<text class="text-1xl oxygen-light">{error}</text>
	</div>
{/await}

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

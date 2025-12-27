<script lang="ts">
	import { MapLibre, Marker, Popup, GeoJSON, LineLayer } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { global, type ViewMode } from '$lib/state.svelte';
	import { onMount, untrack } from 'svelte';
	import type { Data } from '$lib/server/database';
	import type { FeatureCollection, Feature, LineString } from 'geojson';
	import maplibregl from 'maplibre-gl';

	interface Props {
		mapContainer: HTMLDivElement;
		data: Data;
		map: maplibregl.Map;
	}
	let { map = $bindable(), mapContainer = $bindable(), data = $bindable() }: Props = $props();

	const markerStyle = 'h-3 w-3 place-items-center rounded-full focus:outline-2 focus:outline-black';
	const popupStyle = 'text-[1rem] px-3 py-0.4 rounded-md text-white opacity-95';
	let zoom: number = $state(1.5);
	let modal: CreateJourneyModal;
	let error: unknown = $state();
	let attributionControl = new maplibregl.AttributionControl({
		compact: true
	});
	let geoJSON: FeatureCollection | null = $state(null);

	async function getJourneyData(journeyId: string): Promise<any> {
		try {
			const res = await fetch(`/api/journeys?journeyId=${journeyId}`, {
				method: 'GET' // get Journey Data related to journeyId
			});
			global.journeyData = await res.json(); // save Journey Data to global.journeyData
			geoJSON = (await buildGeoJSON()) ?? null;
			console.log(geoJSON);
			return global.journeyData;
		} catch (err) {
			error = err;
		}
	}
	async function buildGeoJSON(): Promise<FeatureCollection | null> {
		let geoJSON: FeatureCollection = {
			type: 'FeatureCollection',
			features: []
		};
		if (global.journeyData?.image) {
			let imagesWithCoords = global.journeyData?.image.filter((img) => {
				return img.lat && img.lng;
			});
			if (imagesWithCoords) {
				let lineString: LineString = {
					type: 'LineString',
					coordinates: []
				};
				for (const img of imagesWithCoords) {
					lineString.coordinates?.push([img.lng!, img.lat!]);
				}
				geoJSON.features.push({
					type: 'Feature',
					geometry: lineString,
					properties: {}
				});
				return geoJSON;
			}
		}
		return null;
	}

	onMount(() => {
		map.addControl(attributionControl);
	});

	$effect(() => {
		// Runs whenever global.viewMode changes
		let currentMode = global.viewMode;
		if (currentMode === 'overview') {
			untrack(() => {
				map.flyTo({
					center: [global.journeyData?.lng ?? 13.388, global.journeyData?.lat ?? 52.517],
					zoom: 1.5,
					speed: 0.7
				});
			});
			attributionControl._container.classList.add('maplibregl-compact-show');
			attributionControl._container.removeAttribute('open');
		}
	});
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
	class="h-full w-full rounded-md"
	dragRotate={false}
	zoomOnDoubleClick={false}
	minZoom={1.5}
	attributionControl={false}
>
	{#if global.viewMode === 'overview'}
		{#each data.journeys as journey}
			<Marker
				lngLat={[journey.lng, journey.lat]}
				class={`${markerStyle} ${journey.color ?? global.journeyData?.color ?? 'bg-black'}`}
			>
				<Popup
					anchor="bottom"
					offset={-15}
					open={true}
					closeOnClickOutside={false}
					closeButton={false}
				>
					<button
						class={`${popupStyle} ${journey.color ?? global.journeyData?.color ?? 'bg-black'}`}
						onclick={() => {
							map.flyTo({ center: [journey.lng, journey.lat], zoom: 10.5, speed: 0.7 });
							global.journeyId = journey.journeyId;
							global.viewMode = 'journey';
							attributionControl._container.setAttribute('open', '');
							attributionControl._container.classList.remove('maplibregl-compact-show');
						}}
					>
						<text class="oxygen-regular">
							{journey.name}
						</text>
					</button>
				</Popup>
			</Marker>
		{/each}
	{/if}
	{#if global.viewMode === 'journey'}
		{#await getJourneyData(global.journeyId)}
			Loading Journey Data...
		{:then}
			{#if global.journeyData?.marker && (global.journeyData?.marker.length ?? 0 > 0)}
				{#each global.journeyData.marker as { name, journeyId, lng, lat, color }}
					<Marker
						lngLat={[lng, lat]}
						class={`${markerStyle} ${color ?? global.journeyData.color ?? 'bg-black'}`}
					>
						<Popup
							anchor="bottom"
							offset={-15}
							open={true}
							closeOnClickOutside={false}
							closeButton={false}
						>
							<button
								class={`rounded-md px-3 py-0.5 text-white opacity-95 ${color ?? global.journeyData.color ?? 'bg-black'}`}
								onclick={() => {
									map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
									global.viewMode = 'overview';
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
								<Marker lngLat={[lat, lng]} class={`${markerStyle} ${color}`} />
							{/if}
						{/each}
					{/if}
				{/each}
			{:else if global.journeyData}
				<Marker
					lngLat={[global.journeyData.lng, global.journeyData.lat]}
					class={`${markerStyle} ${global.journeyData.color ?? 'bg-black'}`}
				>
					<Popup
						anchor="bottom"
						offset={-15}
						open={true}
						closeOnClickOutside={false}
						closeButton={false}
					>
						<button
							class={`rounded-md px-3 py-0.5 text-white opacity-95 ${global.journeyData.color ?? 'bg-black'}`}
							onclick={() => {
								map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
								global.viewMode = 'overview';
								global.journeyId = global.journeyData?.journeyId ?? '';
							}}
						>
							<text class="oxygen-regular">
								{global.journeyData.name}
							</text>
						</button>
					</Popup>
				</Marker>
			{:else}
				{new Error('Map failed to load - no valid data received')}
			{/if}
			{#if geoJSON}
				<GeoJSON data={geoJSON}>
					<LineLayer
						layout={{ 'line-cap': 'round', 'line-join': 'round' }}
						paint={{
							'line-width': 5,
							'line-color': '#008800',
							'line-opacity': 0.8
						}}
					/>
				</GeoJSON>
			{/if}
		{:catch}
			<div
				class="z-1500000 absolute left-[50%] top-[50%] h-fit w-fit -translate-x-1/2 items-center rounded-md bg-red-950 p-3 text-center text-white"
			>
				<text class="oxygen-bold text-2xl">Failed to Load Map</text>
				<br />
				<text class="text-1xl oxygen-light">{error}</text>
			</div>
		{/await}
	{/if}
</MapLibre>

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

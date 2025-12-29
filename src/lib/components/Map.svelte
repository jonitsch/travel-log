<script lang="ts">
	import { MapLibre, Marker, Popup, GeoJSON, LineLayer } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { global } from '$lib/state.svelte';
	import { onMount, untrack } from 'svelte';
	import type { Data, Journey } from '$lib/server/prisma';
	import type { FeatureCollection, LineString } from 'geojson';
	import maplibregl from 'maplibre-gl';
	import ErrorMessage from './ErrorMessage.svelte';

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
	let attributionControl = new maplibregl.AttributionControl({
		compact: true
	});
	let geoJSON: FeatureCollection | null = $state(null);

	async function getJourneyData(journeyId: string): Promise<Journey | null> {
		try {
			const res = await fetch(`/api/journeys?journeyId=${journeyId}`);
			global.journeyData = await res.json();
			geoJSON = (await buildGeoJSON()) ?? null;
			return global.journeyData;
		} catch (err) {
			throw err;
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
			imagesWithCoords.sort((a, b) => {
				if (a.createdOn < b.createdOn) {
					return -1;
				} else if (a.createdOn > b.createdOn) {
					return 1;
				} else {
					return 0;
				}
			});
			if (imagesWithCoords) {
				let lineString: LineString = {
					type: 'LineString',
					coordinates: []
				};
				for (const img of imagesWithCoords) {
					console.log(img.createdOn);
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

	async function getImgProxyURL(src: string, width?: number, height?: number): Promise<string> {
		const params = new URLSearchParams({
			src: src,
			width: width ? Math.round(width)?.toString() : '',
			height: height ? Math.round(height)?.toString() : ''
		});
		const response = await fetch(`/api/imgproxy?${params.toString()}`);
		let url = response.json();
		return url;
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
					speed: 1
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
				class={`${markerStyle} ${journey.color ?? 'bg-black'}`}
			>
				<Popup
					anchor="bottom"
					offset={-15}
					open={true}
					closeOnClickOutside={false}
					closeButton={false}
				>
					<button
						class={`${popupStyle} ${journey.color ?? 'bg-black'}`}
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
		{:then data}
			{@const journey = global.journeyData}
			{#if journey}
				{#if journey.marker.length ?? 0 > 0}
					{#each journey.marker as marker}
						<Marker
							lngLat={[marker.lng, marker.lat]}
							class={`${markerStyle} ${marker.color ?? 'bg-black'}`}
						>
							<Popup
								anchor="bottom"
								offset={-15}
								open={true}
								closeOnClickOutside={false}
								closeButton={false}
							>
								<button
									class={`rounded-md px-3 py-0.5 text-white opacity-95 ${marker.color ?? 'bg-black'}`}
									onclick={() => {
										map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
										global.viewMode = 'overview';
										global.journeyId = marker.journeyId;
									}}
								>
									<text class="oxygen-regular">
										{marker.name}
									</text>
								</button>
							</Popup>
						</Marker>
						{#if journey.image}
							{#each journey.image as img}
								{#if img.lng && img.lat}
									<Marker
										lngLat={[img.lng, img.lat]}
										class={`${markerStyle.replace('h-3 w-3', '')} h-7 w-7`}
									>
										{#await getImgProxyURL(img.path, img.width * 0.1, img.height * 0.1)}
											<div class="color h-[10%] w-[10%] {journey.color} rounded-lg"></div>
										{:then response}
											<img
												src={response}
												alt={img.fileName}
												class="h-full w-full cursor-pointer rounded-lg object-cover hover:scale-105"
											/>
										{/await}
									</Marker>
								{/if}
							{/each}
						{/if}
					{/each}
				{:else}
					<Marker
						lngLat={[journey.lng, journey.lat]}
						class={`${markerStyle} ${journey.color ?? 'bg-black'}`}
					>
						<Popup
							anchor="bottom"
							offset={-15}
							open={true}
							closeOnClickOutside={false}
							closeButton={false}
						>
							<button
								class={`rounded-md px-3 py-0.5 text-white opacity-95 ${journey.color ?? 'bg-black'}`}
								onclick={() => {
									map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
									global.viewMode = 'overview';
									global.journeyId = journey.journeyId ?? '';
								}}
							>
								<text class="oxygen-regular">
									{journey.name}
								</text>
							</button>
						</Popup>
					</Marker>
				{/if}
				{#if geoJSON}
					<GeoJSON data={geoJSON}>
						<LineLayer
							layout={{ 'line-cap': 'round', 'line-join': 'round' }}
							paint={{
								'line-width': 3,
								'line-color': '#008800',
								'line-opacity': 0.8
							}}
						/>
					</GeoJSON>
				{/if}
			{:else}
				{@const error = new Error('Map failed to load - no journey data received')}
				<ErrorMessage {error}>Failed To Load Map</ErrorMessage>
			{/if}
		{:catch err}
			{@const error = err}
			<ErrorMessage {error}>Failed To Load Journey Data</ErrorMessage>
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

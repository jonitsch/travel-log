<script lang="ts">
	import { MapLibre, Marker, GeoJSON, LineLayer } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { global } from '$lib/state.svelte';
	import { onMount, untrack } from 'svelte';
	import type { Data, Journey } from '$lib/server/prisma';
	import type { FeatureCollection, GeoJsonProperties, Geometry, LineString } from 'geojson';
	import maplibregl, { type LngLatBoundsLike } from 'maplibre-gl';
	import ErrorMessage from './ErrorMessage.svelte';
	import JourneyMarker from './JourneyMarker.svelte';
	import { getImgProxyURL } from '$lib/imgproxy';
	import { buildGeoJSON, getBBox, getJourneyData } from '$lib/map';

	interface Props {
		mapContainer: HTMLDivElement;
		data: Data;
		map: maplibregl.Map;
	}
	let { map = $bindable(), mapContainer = $bindable(), data = $bindable() }: Props = $props();

	let bounds = $state<maplibregl.LngLatBoundsLike | undefined>(),
		zoom = $state<number | undefined>(1.5),
		center = $state<maplibregl.LngLatLike | undefined>([13.388, 52.517]);
	let savedViewPort = $state<{
		zoom: number | undefined;
		center: maplibregl.LngLatLike | undefined;
		bounds: maplibregl.LngLatBoundsLike | undefined;
	}>();

	let modal: CreateJourneyModal;
	let attributionControl = $state<maplibregl.AttributionControl>(
		new maplibregl.AttributionControl({
			compact: true
		})
	);
	let selected = $state<boolean>(false);

	async function switchToJourneyMode(journeyId: string): Promise<{
		journey: Journey | null;
		bbox: maplibregl.LngLatBoundsLike | null;
		geoJSON: FeatureCollection<Geometry, GeoJsonProperties> | null;
	} | null> {
		const journey = await getJourneyData(journeyId);
		if (journey) {
			const bbox = await getBBox(journey);
			const geoJSON = await buildGeoJSON(journey);
			if (bbox) {
				map.fitBounds(bbox);
			} else {
				map.flyTo({
					center: [journey.lng, journey.lat]
				});
			}
			attributionControl._container.setAttribute('open', '');
			attributionControl._container.classList.remove('maplibregl-compact-show');

			let data = {
				journey: journey,
				bbox: bbox,
				geoJSON: geoJSON
			};
			return data;
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
					center: savedViewPort?.center ?? [13.388, 52.517],
					zoom: savedViewPort?.zoom ?? 3,
					speed: 1
				});
			});
			attributionControl._container.classList.add('maplibregl-compact-show');
		}
	});
</script>

<CreateJourneyModal bind:this={modal} />

<MapLibre
	standardControls={false}
	bind:map
	bind:mapContainer
	bind:bounds
	bind:zoom
	minZoom={1.5}
	bind:center
	onzoom={() => (zoom = zoom)}
	projection={{ type: 'globe' }}
	class="h-full w-full rounded-md"
	dragRotate={true}
	zoomOnDoubleClick={false}
	attributionControl={false}
	style="https://tiles.openfreemap.org/styles/liberty"
>
	{#if global.viewMode === 'overview'}
		{#each data.journeys as j}
			<JourneyMarker
				popupText={j.name}
				lngLat={[j.lng, j.lat]}
				color={j.color ?? 'bg-black'}
				onclick={() => {
					savedViewPort = {
						center: center,
						zoom: zoom,
						bounds: bounds
					};
					console.log($state.snapshot(savedViewPort));
					global.journeyId = j.journeyId;
					global.viewMode = 'journey';
				}}
				open={true}
			></JourneyMarker>
		{/each}
	{/if}
	{#if global.viewMode === 'journey' && global.journeyId}
		{#await switchToJourneyMode(global.journeyId)}
			Loading Journey Data...
		{:then res}
			{@const journey = res?.journey}
			{@const geoJSON = res?.geoJSON}
			{#if journey}
				{#if journey.marker.length > 0 || geoJSON}
					{#if journey.marker.length > 0}
						{#each journey.marker as marker}
							<JourneyMarker
								popupText={marker.name}
								lngLat={[marker.lng, marker.lat]}
								color={marker.color ?? 'bg-black'}
								onclick={() => {
									global.viewMode = 'overview';
									global.journeyId = undefined;
								}}
								open
							/>
						{/each}
					{/if}
					{#if journey.image}
						{#each journey.image as img}
							{#if img.lng && img.lat}
								<Marker
									lngLat={[img.lng, img.lat]}
									class={'h-7 w-7 place-items-center rounded-full focus:outline-2 focus:outline-black'}
									onclick={() => {
										let el = document.getElementById(`bookpic-${img.id}`);
										if (el) {
											el.scrollIntoView({ behavior: 'smooth' });
										}
									}}
								>
									{#await getImgProxyURL(img.path, img.width * 0.1, img.height * 0.1)}
										<div class="h-full w-full bg-{journey.color} rounded-lg"></div>
									{:then response}
										<img
											src={response}
											alt={img.fileName}
											class="h-full w-full cursor-pointer rounded-lg hover:scale-[110%] hover:z-50"
										/>
									{/await}
								</Marker>
							{/if}
						{/each}
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
					<JourneyMarker
						popupText={journey.name}
						lngLat={[journey.lng, journey.lat]}
						color={journey.color ?? 'bg-black'}
						onclick={() => {
							map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
							global.viewMode = 'overview';
							global.journeyId = journey.journeyId ?? '';
						}}
						open={true}
					/>
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

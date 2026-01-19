<script lang="ts">
	import { MapLibre, Marker, GeoJSON, LineLayer } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { global } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import type { Data } from '$lib/server/prisma';
	import maplibregl from 'maplibre-gl';
	import ErrorMessage from './ErrorMessage.svelte';
	import JourneyMarker from './JourneyMarker.svelte';
	import { getImgProxyURL } from '$lib/imgproxy';
	import { switchToJourneyMode, switchToOverview } from '$src/lib/utils';

	interface Props {
		mapContainer: HTMLDivElement;
		data: Data;
		map: maplibregl.Map;
	}
	let { map = $bindable(), mapContainer = $bindable(), data = $bindable() }: Props = $props();

	let previousElement = $state<HTMLElement | null>(null);

	let bounds = $state<maplibregl.LngLatBoundsLike | undefined>(),
		zoom = $state<number>(0),
		center = $state<maplibregl.LngLatLike | undefined>([13.388, 52.517]);

	let modal: CreateJourneyModal;
	let attributionControl = $state<maplibregl.AttributionControl>(
		new maplibregl.AttributionControl({
			compact: true
		})
	);

	onMount(() => {
		global.map = map;
		map.addControl(attributionControl);
	});

	$effect(() => {
		// close or open attributionControl whenever global.viewMode changes
		let currentMode = global.viewMode;
		if (currentMode === 'overview') {
			attributionControl._container.classList.add('maplibregl-compact-show');
		} else if (currentMode === 'journey') {
			attributionControl._container.setAttribute('open', '');
			attributionControl._container.classList.remove('maplibregl-compact-show');
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
	bind:center
	minZoom={1.5}
	onzoom={() => (zoom = zoom)}
	projection={{ type: 'globe' }}
	class="h-full w-full rounded-md"
	dragRotate={false}
	zoomOnDoubleClick={false}
	attributionControl={false}
	style="https://tiles.openfreemap.org/styles/liberty"
>
	<!-------------------------------------------------- OVERVIEW MODE ---------------------------------------------------->

	{#if global.viewMode === 'overview'}
		{#each data.journeys as journey}
			<JourneyMarker
				popupText={journey.name}
				lngLat={[journey.lng, journey.lat]}
				color={journey.color ?? 'black'}
				onclick={() => {
					global.savedViewPort = {
						center: center,
						zoom: zoom,
						bounds: bounds
					};
					global.journeyId = journey.journeyId;
					global.viewMode = 'journey';
				}}
				open={true}
			/>
			<Marker
				lngLat={[journey.lng, journey.lat]}
				class={`h-3 w-3 place-items-center rounded-full bg-${journey.color}`}
			/>
		{/each}
	{/if}

	<!---------------------------------------------------- JOURNEY MODE ---------------------------------------------------->

	{#if global.viewMode === 'journey' && global.journeyId}
		{#await switchToJourneyMode(global.journeyId)}
			{(global.loadingJourney = true)}
			Loading Journey Data...
		{:then res}
			{map.once('moveend', () => {
				global.loadingJourney = false;
			})}
			{@const journey = res?.journey}
			{@const geoJSON = res?.geoJSON}
			{#if journey}
				{#if journey.marker.length > 0 || geoJSON}
					{#if journey.marker.length > 0}
						{#each journey.marker as marker}
							<JourneyMarker
								popupText={marker.name}
								lngLat={[marker.lng, marker.lat]}
								color={marker.color ?? journey.color}
								onclick={() => switchToOverview()}
								open
							/>
						{/each}
					{/if}
					{#if journey.image && !global.loadingJourney}
						{#each journey.image as img}
							{#if img.lng && img.lat}
								<Marker
									lngLat={[img.lng, img.lat]}
									class={'h-7 w-7 place-items-center rounded-full focus:outline-2 focus:outline-black'}
									onclick={() => {
										if (previousElement) previousElement.style.border = '';
										let bookpic = document.getElementById(`bookpic-${img.id}`);
										if (bookpic) {
											if (previousElement === bookpic) {
												bookpic.style.border = '';
												previousElement = null;
												return;
											}
											bookpic.scrollIntoView({ behavior: 'smooth' });
											bookpic.style.border = 'solid #475569 5px';
											previousElement = bookpic;
											window.addEventListener('click', () => {
												if (previousElement) previousElement.style.border = '';
												window.removeEventListener('click', () => {});
											});
										}
									}}
									ondblclick={() => {
										let newZoom = (zoom ?? 0) + 5;
										map.flyTo({center: [img.lng!, img.lat!] , zoom: newZoom})
									}}
								>
									{#await getImgProxyURL(img.path, img.width * 0.05, img.height * 0.05)}
										<div class="h-full w-full bg-{journey.color} rounded-lg"></div>
									{:then response}
										<img
											src={response}
											alt={img.fileName}
											class="h-full w-full cursor-pointer rounded-lg hover:z-50 hover:scale-[110%]"
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
						color={journey.color ?? 'black'}
						onclick={() => switchToOverview()}
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

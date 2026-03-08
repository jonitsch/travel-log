<script lang="ts">
	import { MapLibre, Marker, GeoJSON, LineLayer, Control } from 'svelte-maplibre';
	import maplibregl from 'maplibre-gl';
	import { innerWidth } from 'svelte/reactivity/window';
	import { global, type ViewMode } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import { calcInitZoom, defaultMapCenter, switchToJourney, switchToOverview } from '$lib/utils/client';
	import SVGIcon from './SVGIcon.svelte';
	import type { Journey } from '$gen/prisma/client/client';
	import ErrorMessage from './ErrorMessage.svelte';
	import JourneyMarker from './JourneyMarker.svelte';
	import ImageMarker from './ImageMarker.svelte';
	import HoverButton from './HoverButton.svelte';
	import CreateJourneyModal from './modal/CreateJourneyModal.svelte';

	interface Props {
		mapContainer: HTMLDivElement;
		journeys: Journey[];
		map: maplibregl.Map;
	}
	let { map = $bindable(), mapContainer = $bindable(), journeys = $bindable() }: Props = $props();

	let bounds = $state<maplibregl.LngLatBoundsLike | undefined>(),
		center = $state<maplibregl.LngLatLike | undefined>(defaultMapCenter);

	let initialZoom = calcInitZoom(innerWidth.current ?? 0),
		zoom = $state<number>(initialZoom);

	let createJourneyModal = $state<CreateJourneyModal>();

	let attributionControl = $state<maplibregl.AttributionControl>(
		new maplibregl.AttributionControl({
			compact: true
		})
	);
	function setAttributionControl(viewMode: ViewMode) {
		if (viewMode === 'overview' || viewMode === 'createJourney') {
			attributionControl._container.classList.add('maplibregl-compact-show');
			attributionControl._container.setAttribute('open', 'true');
		} else if (viewMode === 'journey') {
			attributionControl._container.setAttribute('open', '');
			attributionControl._container.classList.remove('maplibregl-compact-show');
		}
	}

	onMount(async () => {
		global.map = map;
		map.addControl(attributionControl);
		attributionControl._container.classList.add('sm:text-[16px]', 'text-[12px]');
		setAttributionControl(global.viewMode);

		// prevent non-critical styleimagemissing warnings in the browser
		const emptyImage = {
			width: 1,
			height: 1,
			data: new Uint8Array([0, 0, 0, 0])
		};
		map.on('styleimagemissing', (e) => {
			if (!map.hasImage(e.id)) {
				map.addImage(e.id, emptyImage);
			}
		});
	});

	$effect(() => {
		global.center = center;
		// close or open attributionControl whenever global.viewMode changes
		let currentMode = global.viewMode;
		setAttributionControl(currentMode);
	});
</script>

<div class="map-wrapper">
	<MapLibre
		bind:map
		bind:mapContainer
		bind:bounds
		bind:zoom
		bind:center
		projection={{ type: 'globe' }}
		class="map-canvas size-full rounded-md"
		dragRotate={false}
		standardControls={false}
		zoomOnDoubleClick={false}
		attributionControl={false}
		style="https://tiles.openfreemap.org/styles/liberty"
	>
		<!-------------------------------------------------- OVERVIEW MODE ---------------------------------------------------->

		{#if global.viewMode === 'overview'}
			{#if journeys}
				<Control
					class="animate-slide-right flex flex-col items-end gap-2"
					position="top-right"
					defaultStyling={true}
				>
					<HoverButton anchor="left" onclick={() => switchToOverview()} class="cursor-pointer">
						{#snippet content()}
							<SVGIcon type="reset" fill="white" hoverScale={false} scale={1.25} />
						{/snippet}
						{#snippet hoveredContent()}
							<div class="text-xl text-white" id="addJourneyText">Reset View</div>
						{/snippet}
					</HoverButton>
					<HoverButton anchor="left" onclick={() => createJourneyModal?.openModal()}>
						{#snippet content()}
							<SVGIcon type="globePlus" fill="white" hoverScale={false} scale={1.25} />
						{/snippet}
						{#snippet hoveredContent()}
							<div class="text-xl text-white" id="addJourneyText">Add Journey</div>
						{/snippet}
					</HoverButton>
				</Control>

				{#each journeys as journey}
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
				{/each}
			{/if}
		{/if}

		<!---------------------------------------------------- JOURNEY MODE ---------------------------------------------------->

		{#if global.viewMode === 'journey' && global.journeyId}
			{#await switchToJourney(global.journeyId)}
				<div hidden>{(global.loadingJourney = true)}</div>
				<div class="text-white">Loading Journey Data...</div>
			{:then res}
				{map.once('moveend', () => {
					setTimeout(() => {
						global.loadingJourney = false;
					}, 200);
				})}
				{@const journey = res?.journey}
				{@const geoJSON = res?.geoJSON}
				{#if journey}
					{@const trackedImages = journey.image.filter((img) => {
						return img.lng && img.lat;
					})}
					{#if !(trackedImages.length === 0 && journey.marker.length === 0)}
						{#each journey.marker as marker}
							<JourneyMarker
								popupText={marker.name}
								lngLat={[marker.lng, marker.lat]}
								color={marker.color ?? journey.color}
								onclick={() => switchToOverview()}
								open
							/>
						{/each}
						{#if journey.image && !global.loadingJourney}
							{#each journey.image as img}
								<ImageMarker {img} color={journey.color} />
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
</div>

<!------------------- CREATE JOURNEY MODAL --------------------->
<CreateJourneyModal bind:this={createJourneyModal} />

<style>
	:global(.maplibregl-popup-content) {
		background-color: transparent;
		border-radius: 15px;
		box-shadow: none;
		font-size: var(--text-1xl);
		padding: 0px;
	}
	/* needed to prevent maplibre from overwriting border color for popup tip */
	:global(.maplibregl-popup .maplibregl-popup-tip) {
		border-top-color: inherit;
	}

	/* needed to prevent maplibre from overwriting bg-color for control buttons */
	:global(.maplibregl-ctrl button.custom-hover-btn:hover) {
		background-color: rgb(17 24 39);
	}
</style>

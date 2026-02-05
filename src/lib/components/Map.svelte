<script lang="ts">
	import { MapLibre, Marker, GeoJSON, LineLayer, Control, ControlButton } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';
	import { global } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import type { Data } from '$lib/server/prisma';
	import maplibregl from 'maplibre-gl';
	import ErrorMessage from './ErrorMessage.svelte';
	import JourneyMarker from './JourneyMarker.svelte';
	import { switchToJourneyMode, switchToOverview } from '$src/lib/utils';
	import SVGIcon from './SVGIcon.svelte';
	import ImageMarker from './ImageMarker.svelte';

	interface Props {
		mapContainer: HTMLDivElement;
		data: Data;
		map: maplibregl.Map;
		createJourneyModal: CreateJourneyModal | undefined;
	}
	let {
		map = $bindable(),
		mapContainer = $bindable(),
		data = $bindable(),
		createJourneyModal = $bindable()
	}: Props = $props();

	let bounds = $state<maplibregl.LngLatBoundsLike | undefined>(),
		zoom = $state<number>(0),
		center = $state<maplibregl.LngLatLike | undefined>([13.388, 52.517]);

	let attributionControl = $state<maplibregl.AttributionControl>(
		new maplibregl.AttributionControl({
			compact: true
		})
	);

	onMount(async () => {
		global.map = map;
		map.addControl(attributionControl);
		let currentMode = global.viewMode;
		if (currentMode === 'overview') {
			attributionControl._container.classList.add('maplibregl-compact-show');
		} else if (currentMode === 'journey') {
			attributionControl._container.setAttribute('open', '');
			attributionControl._container.classList.remove('maplibregl-compact-show');
		}
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

<div class="map-wrapper">
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
		class="map-canvas size-full rounded-md"
		dragRotate={false}
		zoomOnDoubleClick={false}
		attributionControl={false}
		style="https://tiles.openfreemap.org/styles/liberty"
	>
		<!-------------------------------------------------- OVERVIEW MODE ---------------------------------------------------->

		{#if global.viewMode === 'overview'}
			<Control>
				<ControlButton onclick={() => createJourneyModal?.toggle()}>
					<div
						class="animate-slide-right group flex flex-row items-center gap-1 rounded-md bg-gray-900 p-2"
					>
						<div class="text-1xl hidden text-white group-hover:block" id="addJourneyText">
							Add Journey
						</div>
						<div id="addJourneyIcon" class="relative">
							<SVGIcon type="globePlus" fill="white" hoverScale={false} />
						</div>
					</div>
				</ControlButton>
			</Control>
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
					class={`size-3 place-items-center rounded-full bg-${journey.color}`}
				/>
			{/each}
		{/if}

		<!---------------------------------------------------- JOURNEY MODE ---------------------------------------------------->

		{#if global.viewMode === 'journey' && global.journeyId}
			{#await switchToJourneyMode(global.journeyId)}
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
								<ImageMarker {img} color={journey.color} {zoom} />
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

<style>
	:global(.maplibregl-map) {
		font: inherit;
		margin-right: calc(100vw / 2) px;
	}

	.map-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		background: #030712;
	}

	.map-wrapper .map-canvas {
		position: relative;
		width: 100%;
		height: 100%;
		background: transparent;
		border-radius: inherit;
	}

	/* Glow layer */
	.map-wrapper::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		background: radial-gradient(
			circle 800px at center,
			rgba(56, 189, 248, 0.65) 0%,
			rgba(56, 189, 248, 0.25) 30%,
			rgba(56, 189, 248, 0.05) 55%,
			transparent 75%
		);
		filter: blur(8px);
		opacity: 0.9;
		z-index: 0;
	}

	/* Make sure the actual canvas is above the glow */
	.map-wrapper .map-canvas > :global(.maplibregl-canvas),
	.map-wrapper .map-canvas > :global(canvas) {
		position: relative;
		z-index: 1;
	}

	:global(.maplibregl-popup-content) {
		background-color: transparent;
		border-radius: 15px;
		box-shadow: none;
		font-size: var(--text-1xl);
		padding: 0px;
	}
	:global(.maplibregl-popup .maplibregl-popup-tip) {
		border-top-color: inherit;
	}
</style>

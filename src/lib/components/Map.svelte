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
	}
	let { map = $bindable(), mapContainer = $bindable(), data = $bindable() }: Props = $props();

	let zoom: number = $state(1.5);
	let modal: CreateJourneyModal;
	let enabled = $state(false);
	let markers: any = $state(data.markers ?? []);
	let images: any = $state();
	let error = $state();
	let currentJourney: any = $state();
	let showImages = $state<boolean>(true);

	let mapJourneyId = $state('default');
	/* 	async function filterMarkers(mapJourneyId: string){
		markers = markers.filter((marker) => {
			return marker.journeyId == mapJourneyId ? true : false
		})
	} */

	async function updateMarkers(journeyId: string) {
		try {
			const res = await fetch(`/api/journeys?journeyId=${journeyId}`, {
				method: 'GET'
			});
			currentJourney = await res.json();
		} catch (err) {
			error = err;
		}
	}

	async function getImages(dir: string) {
		let response = await fetch(`/api/images?dir=${dir}`, {
			method: 'GET'
		});
		images = await response.json();
		images = images;
	}

	onMount(() => {
		updateMarkers('default');
	});
</script>

<CreateJourneyModal bind:this={modal} />

{#if enabled}
	<button
		class="absolute top-[15px] left-[50%] z-999 h-fit w-fit -translate-x-1/2 items-center rounded-md bg-emerald-900 p-3 text-2xl text-white"
		onclick={() => {
			markers = updateMarkers('default');
			map.flyTo({ center: [13.388, 52.517], zoom: 1.5 });
			enabled = false;
		}}
	>
		{currentJourney.name}
	</button>
{/if}

{#await updateMarkers('default')}
	Loading...
{:then showMap}
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
		<!--
 	<Control class="rounded-md bg-gray-900 p-3 text-white">
		<ControlButton>
			{zoom.toPrecision(3)}
		</ControlButton>
	</Control> 
-->
		{#each currentJourney.marker as { lng, lat, name, journeyId, journey, color, nextId }}
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
								map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
								enabled = false;
							} else {
								map.flyTo({ center: [lng, lat], zoom: 10.5, speed: 0.7 });
								enabled = true;
								currentJourney = name;
							}
							updateMarkers(nextId ?? journeyId);
							if (journeyId != 'default') {
								getImages(`pictures/${journeyId}`);
							}
							showImages = true;
						}}
					>
						<text class="oxygen-regular">
							{name}
						</text>
					</button>
				</Popup>
			</Marker>
			{#if showImages && journeyId != 'default'}
				{#await getImages(`pictures/${journeyId}`)}
					'loading images'
				{:then done}
					{#each images as { name, path, lng, lat, type }}
						{#if lng && lat && type != 'HEIC'}
							<Marker
								lngLat={[lng, lat]}
								class={`grid h-2 w-2 place-items-center rounded-full bg-red-900 text-black shadow-2xl focus:outline-2 focus:outline-black`}
							>
								<Popup anchor="bottom" openOn="click">
									<img src={path} alt={name} class="max-w-[5vw] border border-amber-950" />
								</Popup>
							</Marker>
						{/if}
					{/each}
				{/await}
			{/if}
		{/each}
	</MapLibre>
{:catch}
	<div
		class="absolute top-[50%] left-[50%] z-1500000 h-fit w-fit -translate-x-1/2 items-center rounded-md bg-red-950 p-3 text-center text-white"
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

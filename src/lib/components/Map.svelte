<script lang="ts">
	import { Control, ControlButton, ControlGroup, MapLibre, Marker, Popup } from 'svelte-maplibre';
	import CreateJourneyModal from './CreateJourneyModal.svelte';

	interface Props {
		mapContainer: HTMLDivElement;
		data: {
			journeys: {
				journeyId: string;
				name: string;
				color: string;
				lng: number;
				lat: number;
				marker: {
					journeyId: string;
					name: string;
					color: string;
					lng: number;
					lat: number;
					id: number;
				}[];
				image: {
					journeyId: string;
					lng: number | null;
					lat: number | null;
					path: string;
					fileName: string;
					width: number;
					height: number;
				}[];
			}[];
		};
		map: maplibregl.Map;
		currentJourneyData: any;
		viewMode: string;
	}
	let {
		map = $bindable(),
		mapContainer = $bindable(),
		data = $bindable(),
		currentJourneyData = $bindable(),
		viewMode = $bindable()
	}: Props = $props();

	let zoom: number = $state(1.5);
	let modal: CreateJourneyModal;
	let enabled = $state(false);
	let images: any = $state();
	let error = $state();
	let currentJourneyId: string = $state('');
	let showImages = $state<boolean>(true);

	async function getJourneyData(journeyId: string): Promise<any> {
		try {
			const res = await fetch(`/api/journeys?journeyId=${journeyId}`, {
				method: 'GET' // get Journey Data related to journeyId
			});
			currentJourneyData = await res.json(); // save Journey Data to currentJourneyData
			return currentJourneyData;
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

	export function switchModes() {
		viewMode = viewMode === 'overview' ? 'journey' : 'overview';
		if (viewMode === 'overview') {
			mapContainer.style = 'width: 100vw';
			enabled = false;
			showImages = false;
		}
		if (viewMode === 'journey') {
			enabled = true;
			showImages = true;
			// getImages(`pictures/${journeyId}`);
		}
	}

	// $inspect('currentJourneyData',currentJourneyData);
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
	{#if viewMode === 'overview'}
		{#each data.journeys as { lng, lat, name, journeyId, color }}
			<Marker
				lngLat={[lng, lat]}
				class={`h-3 w-3 place-items-center rounded-full ${color ?? currentJourneyData.color ?? 'bg-black'} focus:outline-2 focus:outline-black`}
			>
				<Popup
					anchor="bottom"
					offset={-15}
					open={true}
					closeOnClickOutside={false}
					closeButton={false}
				>
					<button
						class={`px-3 py-0.5 ${color ?? currentJourneyData.color ?? 'bg-black'} rounded-md text-white opacity-95`}
						onclick={() => {
							map.flyTo({ center: [lng, lat], zoom: 10.5, speed: 0.7 });
							viewMode = 'journey';
							enabled = true;
							showImages = true;
							currentJourneyId = journeyId;
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
		<ControlButton>
			{viewMode}
		</ControlButton>
	</Control>
	{#if viewMode === 'journey'}
		{#await getJourneyData(currentJourneyId)}
			Loading Journey Data...
		{:then currentJourneyData}
			{console.log($state.snapshot(currentJourneyData))}
			{#each currentJourneyData.marker as { i, lng, lat, name, journeyId, journey, color, image }}
				<Marker
					lngLat={[lng, lat]}
					class={`h-3 w-3 place-items-center rounded-full ${color ?? currentJourneyData.color ?? 'bg-black'} focus:outline-2 focus:outline-black`}
				>
					<Popup
						anchor="bottom"
						offset={-15}
						open={true}
						closeOnClickOutside={false}
						closeButton={false}
					>
						<button
							class={`px-3 py-0.5 ${color ?? currentJourneyData.color ?? 'bg-black'} rounded-md text-white opacity-95`}
							onclick={() => {
								map.flyTo({ center: [13.388, 52.517], zoom: 1.5, speed: 0.7 });
								viewMode = 'overview';
								mapContainer.style = 'width: 100vw';
								enabled = false;
								showImages = false;
								currentJourneyId = journeyId;
							}}
						>
							<text class="oxygen-regular">
								{name}
							</text>
						</button>
					</Popup>
				</Marker>
				{#if currentJourneyData.image}
					{#each currentJourneyData.image as { lng, lat, fileName }}
						{#if lng && lat}
							<Marker
								lngLat={[lat, lng]}
								class={`grid h-2 w-2 place-items-center rounded-full ${color} text-black shadow-2xl focus:outline-2 focus:outline-black`}
							/>
						{/if}
					{/each}
				{/if}
			{/each}
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

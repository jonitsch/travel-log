<script lang="ts">
	import { Marker, Popup } from 'svelte-maplibre';
	import { type LngLatLike } from 'maplibre-gl';
	import { buildGeoJSON } from '../utils';

	type Props = {
		lngLat: LngLatLike;
		popupText?: string | null;
		color: string;
		onclick?: () => void;
		open?: boolean;
	}
	let {
		lngLat,
		popupText = null,
		color,
		onclick = () => {},
		open = false,
	}: Props = $props();
</script>

<Marker {lngLat} class={`h-3 w-3 place-items-center rounded-full bg-${color}`}>
	{#if popupText}
		<Popup
			anchor="bottom"
			offset={7}
			closeOnClickOutside={false}
			closeButton={false}
			popupClass="border-{color}"
			{open}
		>
			<button
				class={`items-center rounded-md px-3 py-px text-sm text-white opacity-95 bg-${color} transition-all duration-200 hover:scale-105`}
				onclick={() => onclick()}
			>
				<text class="oxygen-regular">
					{popupText}
				</text>
			</button>
		</Popup>
	{/if}
</Marker>

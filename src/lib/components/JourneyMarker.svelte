<script lang="ts">
	import { Marker, Popup } from 'svelte-maplibre';
	import { type LngLatLike } from 'maplibre-gl';
	import { buildGeoJSON } from '../utils';

	interface Props {
		lngLat: LngLatLike;
		popupText?: string | null;
		height?: string;
		width?: string;
		color: string;
		onclick?: () => void;
		open?: boolean;
		rest?: any;
	}
	let {
		lngLat,
		popupText = null,
		height = '3',
		width = '3',
		color,
		onclick = () => {},
		open = false,
		...rest
	}: Props = $props();
</script>

<Marker {lngLat} class={`h-${height} w-${width} place-items-center rounded-full bg-${color}`}>
	{#if popupText}
		<Popup
			anchor="bottom"
			offset={7}
			closeOnClickOutside={false}
			closeButton={false}
			popupClass="border-{color}"
			{open}
			{...rest}
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

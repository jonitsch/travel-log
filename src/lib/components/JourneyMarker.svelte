<script lang="ts">
	import { Marker, Popup } from 'svelte-maplibre';
	import { type LngLatLike } from 'maplibre-gl';

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
			offset={-15}
			closeOnClickOutside={false}
			closeButton={false}
			{open}
			{...rest}
		>
			<button
				class={`rounded-md px-3 py-[1px] text-sm text-white opacity-95 bg-${color}`}
				onclick={() => onclick()}
			>
				<text class="oxygen-regular">
					{popupText}
				</text>
			</button>
		</Popup>
	{/if}
</Marker>

<style>
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

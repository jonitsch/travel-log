<script lang="ts">
	import { Marker, Popup } from 'svelte-maplibre';
	import { type LngLatLike } from 'maplibre-gl';
	import type { Snippet } from 'svelte';
	import type { Image } from '../server/prisma';

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

	const markerStyle = 'place-items-center rounded-full focus:outline-2 focus:outline-black';
	const popupStyle = 'text-[1rem] px-3 py-0.4 rounded-md text-white opacity-95';
</script>

<Marker {lngLat} class={`h-${height} w-${width} ${markerStyle} bg-${color}`}>
	{#if popupText}
		<Popup
			anchor="bottom"
			offset={-15}
			closeOnClickOutside={false}
			closeButton={false}
			{open}
			{...rest}
		>
			<button class={`${popupStyle} bg-${color}`} onclick={() => onclick()}>
				<text class="oxygen-regular">
					{popupText}
				</text>
			</button>
		</Popup>
	{/if}
</Marker>

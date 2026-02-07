<script lang="ts">
	import { Button } from '$src/lib/components/shadcn/button';
	import { MapLibre } from 'svelte-maplibre';
	import { innerWidth } from 'svelte/reactivity/window';

	let map = $state<maplibregl.Map>();

	let zoom = $derived.by(() => {
		if (!map) return;
		if (innerWidth.current) {
			const newZoom = innerWidth.current * 0.0025;
			return newZoom < 1.7 ? newZoom : 1.7;
		}
	});
</script>

<div class="flex size-full flex-col items-center bg-transparent">
	<div class="oxygen-bold h-fit w-full text-center text-gray-300 mb-5 xl:text-7xl lg:text-7xl md:text-6xl sm:text-5xl text-[28px]">
		Welcome to Travel-Log!
	</div>
	<Button
		variant="default"
		class="h-fit w-fit bg-emerald-500 xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl text-sm hover:-translate-y-1 hover:bg-emerald-400"
		href="/auth/login">Sign in to create your first Journey!</Button
	>
	<div class="flex-1 size-full">
		<div class="map-wrapper overflow-visible">
			<div id="mapContainer" class="size-full">
				<MapLibre
					bind:map
					bind:zoom
					center={[13.388, 0.517]}
					projection={{ type: 'globe' }}
					class="map-canvas size-full rounded-md"
					interactive={true}
					standardControls={false}
					style="https://tiles.openfreemap.org/styles/liberty"
				/>
			</div>
		</div>
	</div>
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
		background: transparent;
	}

	/* Glow layer */
	.map-wrapper::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		background: radial-gradient(
			circle 500px at center,
			rgba(56, 189, 248, 0.65) 0%,
			rgba(56, 189, 248, 0.25) 30%,
			rgba(56, 189, 248, 0.05) 55%,
			transparent 75%
		);
		filter: blur(8px);
		opacity: 0.9;
		z-index: 0;
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

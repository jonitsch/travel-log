<script lang="ts">
	import { Button } from '$src/lib/components/shadcn/button';
	import { calculateInitialZoom, defaultMapCenter } from '$src/lib/utils';
	import { MapLibre } from 'svelte-maplibre';
	import { innerWidth } from 'svelte/reactivity/window';

	let map = $state<maplibregl.Map>();
	let zoom = $state<number>(calculateInitialZoom(innerWidth.current ?? 0));
</script>

<div class="flex size-full flex-col items-center bg-transparent">
	<div
		class="oxygen-bold mb-7 h-fit w-full text-center text-[28px] text-gray-300 sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl"
	>
		Welcome to Travel-Log!
	</div>
	<Button
		variant="default"
		class="h-fit w-fit bg-emerald-500 text-sm hover:-translate-y-1 hover:bg-emerald-400 sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl"
		href="/auth/login">Sign in to create your first Journey!</Button
	>
	<div class="size-full flex-1">
		<div class="map-wrapper overflow-visible transition-all duration-200 group-hover:scale-105">
			<div id="mapContainer" class="size-full">
				<MapLibre
					bind:map
					bind:zoom
					center={defaultMapCenter}
					projection={{ type: 'globe' }}
					class="map-canvas size-full rounded-md"
					maxZoom={1.45}
					dragPan={false}
					pitchWithRotate={false}
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

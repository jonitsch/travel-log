<script lang="ts">
	import { Button } from '$lib/components/shadcn/button';
	import { calcOptimizedZoom, defaultMapCenter } from '$lib/utils/client';
	import { MapLibre } from 'svelte-maplibre';
	import { innerWidth } from 'svelte/reactivity/window';

	let map = $state<maplibregl.Map>();
	let zoom = $state<number>(calcOptimizedZoom(innerWidth.current ?? 0));
</script>

<div class="flex size-full flex-col items-center bg-transparent">
	<div
		class="oxygen-bold mb-2 h-fit w-full text-center text-[28px] text-gray-300 sm:mb-4 sm:text-5xl md:text-6xl lg:mb-7 lg:text-7xl"
	>
		Welcome to Travel-Log!
	</div>
	<Button
		variant="default"
		class="h-fit w-fit bg-emerald-500 text-sm hover:-translate-y-1 hover:bg-emerald-400 sm:text-xl md:text-2xl lg:text-3xl"
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

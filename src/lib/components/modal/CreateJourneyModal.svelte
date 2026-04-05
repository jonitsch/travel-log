<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import JourneyMarker from '../JourneyMarker.svelte';
	import Modal from './Modal.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	let modal = $state<Modal>(),
		form = $state<HTMLFormElement>(),
		map = $state<maplibregl.Map>(),
		zoom = $derived.by<number>(() => {
			if (!innerWidth.current) return 1.1;
			return 0.00055 * innerWidth.current;
		});

	let open = $state(false),
		currentStep = $state<'Name' | 'Color' | 'Coordinates' | 'Submit'>('Name');

	const twColors = ['red', 'yellow', 'emerald', 'blue', 'purple', 'pink'];
	const buttonStyle =
		'rounded-md border-b-4 border-b-gray-700 bg-gray-900 p-5 sm:text-4xl text-xl transition hover:-translate-y-1';

	const previewStyle =
		'w-full rounded-md border-b-4 border-b-black/40 px-3 py-2 text-center sm:text-6xl opacity-100 text-[25px]';

	let selectedColorElement = $state<HTMLButtonElement>(),
		nameInput = $state<HTMLInputElement>(),
		colorInput = $state<HTMLInputElement>();

	let name = $state(''),
		lng = $state<number>(),
		lat = $state<number>(),
		color = $state<string>(),
		topBorderColor = $derived(
			color ? `border-t-${color} opacity-30` : 'border-t-slate-900 opacity-80'
		);
	function setPreviewColor() {
		if (selectedColorElement && colorInput) {
			const currentColor = window.getComputedStyle(selectedColorElement).backgroundColor;
			colorInput.style.background = currentColor;
			colorInput.style.color = 'white';
		}
	}
	export async function openModal() {
		open = true;
	}
	export function reset() {
		name = '';
		lng = undefined;
		lat = undefined;
		color = undefined;
	}

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		if (target.value.length) {
			target.style.width = '0px';
			target.style.width = `${Math.max(target.scrollWidth, 130)}px`;
		} else {
			target.style.width = 'auto';
		}
	}

	$effect(() => {
		if (currentStep === 'Name' && nameInput?.value.length) {
			nameInput.style.width = '0px';
			nameInput.style.width = `${Math.max(nameInput.scrollWidth, 130)}px`;
		}
		color;
		setPreviewColor();

		// focus nameInput whenever its rendered on screen
		if (nameInput) nameInput.focus();
	});

	export function handleSubmit() {
		if (currentStep === 'Name') {
			currentStep = 'Color';
		} else if (currentStep === 'Color') {
			currentStep = 'Coordinates';
		} else if (currentStep === 'Coordinates') {
			currentStep = 'Submit';
		}
	}
</script>

{#snippet previewTip()}
	<div
		class="{topBorderColor} border-t-36 border-r-36 border-l-36
				border-r-transparent border-l-transparent"
	></div>
{/snippet}

<Modal bind:this={modal} bind:open>
	<div class="animate-slide-right flex h-[70dvh] flex-col items-center justify-between">
		<!-- Modal body -->
		{#if currentStep === 'Name'}
			<!-- Name -->
			<div class="flex h-full flex-1 items-center justify-center">
				<div class="flex flex-col items-center">
					<input
						id="nameInput"
						bind:this={nameInput}
						bind:value={name}
						type="text"
						maxlength={25}
						autocomplete="off"
						placeholder="Start with a name..."
						class="{previewStyle} bg-{color ?? 'slate-900'}"
						oninput={(e) => handleInput(e)}
						onkeydown={(e) => (e.key === 'Enter' ? handleSubmit() : null)}
					/>
					{@render previewTip()}
				</div>
			</div>
			<div>
				<button
					type="button"
					onclick={() => handleSubmit()}
					class={buttonStyle}
					class:disabled={name.length === 0}
					disabled={name.length === 0}>Choose Color</button
				>
			</div>
		{:else if currentStep === 'Color'}
			<!-- Color -->
			<div class="flex h-full flex-1 flex-col items-center justify-center gap-5">
				<div class="flex flex-col items-center">
					<div class="{previewStyle} bg-{color ?? 'slate-900'}">
						{name}
					</div>
					{@render previewTip()}
				</div>
				<div class="grid grid-cols-[repeat(5,1fr)] place-items-center gap-2">
					{#each twColors as twColor}
						{#each { length: 5 } as el, i}
							{@const currentColor = `${twColor}-${900 - i * 100}`}
							<button
								id={currentColor}
								class="bg-{currentColor} size-12 rounded-full transition duration-100 ease-in-out hover:scale-[120%]"
								aria-label="Select color {currentColor}"
								class:selected={currentColor === color}
								onclick={() => (color = currentColor)}
								type="button"
								title={currentColor}
							></button>
						{/each}
					{/each}
				</div>
			</div>
			<div class="flex flex-row gap-2">
				<button type="button" onclick={() => (currentStep = 'Name')} class={buttonStyle}
					>Edit Name
				</button>
				<button
					type="button"
					onclick={() => handleSubmit()}
					class={buttonStyle}
					class:disabled={!color}
					title={!color ? 'Choose a color first!' : ''}
					disabled={!color}
				>
					Choose Location
				</button>
			</div>
		{:else if currentStep === 'Coordinates'}
			<!-- Submit -->
			<div class="w-[90dvw] sm:w-[75dvw] lg:w-[56dvw]">
				<input name="lng" bind:value={lng} type="hidden" />
				<input name="lng" bind:value={lat} type="hidden" />
				<MapLibre
					bind:map
					bind:zoom
					style="https://tiles.openfreemap.org/styles/liberty"
					class="map-canvas h-130 rounded-md"
					onclick={(e) => {
						if (!map) throw Error('Click on CreateJourneyModal-Map: Map not defined!');
						lng = e.lngLat.lng;
						lat = e.lngLat.lat;
					}}
					center={[0, 20]}
				>
					{#if lng && lat && color}
						<JourneyMarker lngLat={[lng, lat]} popupText={name} {color} open />
					{/if}
				</MapLibre>
			</div>
			<div class="flex w-full justify-between gap-2 whitespace-nowrap">
				<button type="button" onclick={() => (currentStep = 'Color')} class="{buttonStyle} flex-1">
					Change Color
				</button>
				<button
					type="button"
					onclick={() => handleSubmit()}
					class="{buttonStyle} flex-1"
					class:disabled={!lng || !lat}
					title={!color ? 'Choose a color first!' : ''}
					disabled={!color}>Submit</button
				>
			</div>
		{:else if currentStep === 'Submit'}
			<div class="flex flex-1 flex-col items-center justify-center">
				<div
					class="{previewStyle} flex bg-{color ?? 'gray-900'} py-6 text-4xl sm:text-6xl md:text-7xl"
				>
					Create Journey?
				</div>
				{@render previewTip()}
			</div>
			<form
				bind:this={form}
				action="?/addJourney"
				method="POST"
				class="flex flex-row items-center gap-2 whitespace-nowrap"
			>
				<input name="name" value={name} type="hidden" />
				<input name="color" value={color} type="hidden" />
				<input name="lng" value={lng} type="hidden" />
				<input name="lat" value={lat} type="hidden" />
				<button
					type="submit"
					class="{buttonStyle} flex-1"
					class:disabled={!name || !color || !lng || !lat}
					disabled={!name || !color || !lng || !lat}>Confirm</button
				>
				<button
					type="button"
					class="{buttonStyle} flex-1"
					onclick={() => (currentStep = 'Coordinates')}>Cancel</button
				>
			</form>
		{/if}
	</div>
</Modal>

<style>
	.disabled {
		filter: grayscale(90%);
		color: rgb(87, 87, 87);
		translate: none;
		cursor: auto;
	}
	.selected {
		box-shadow: inset 0px 0px 0px 4px #0000009e;
		transform: scale(1.4);
	}

	input:focus {
		outline: none !important;
		box-shadow: none !important; /* emerald focus ring */
	}
	input:focus-visible {
		outline: none !important;
	}
</style>

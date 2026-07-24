<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import JourneyMarker from '../map/JourneyMarker.svelte';
	import Modal from './Modal.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	let map = $state<maplibregl.Map>(),
		zoom = $derived.by<number>(() => {
			if (!innerWidth.current) return 1.1;
			return 0.00055 * innerWidth.current;
		});

	type Step = 'Name' | 'Color' | 'Coordinates' | 'Submit';
	const steps: Step[] = ['Name', 'Color', 'Coordinates', 'Submit'];

	let open = $state(false),
		currentStep = $state<Step>('Name');

	const twColors = ['red', 'yellow', 'emerald', 'blue', 'purple', 'pink'];
	const buttonStyle =
		'rounded-md border-b-4 border-b-gray-700 bg-gray-900 p-5 sm:text-4xl text-xl transition hover:-translate-y-1';

	const previewStyle =
		'rounded-md border-b-4 border-b-black/40 px-3 py-3 sm:py-4 text-[25px] sm:text-6xl opacity-100 text-center leading-snug';

	let selectedColorElement = $state<HTMLButtonElement>(),
		nameInput = $state<HTMLInputElement>(),
		colorInput = $state<HTMLInputElement>(),
		form = $state<HTMLFormElement>();

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

	function nextStep() {
		const currentIndex = steps.indexOf(currentStep);
		if (currentStep === 'Submit') {
			form?.submit();
		} else {
			currentStep = steps[currentIndex + 1];
		}
	}

	function prevStep() {
		const currentIndex = steps.indexOf(currentStep);
		if (currentStep === 'Name') {
			open = false;
			return;
		}
		currentStep = steps[currentIndex - 1];
	}

	$effect(() => {
		if (currentStep === 'Name' && nameInput?.value.length) {
			nameInput.style.width = '0px';
			nameInput.style.width = `${Math.max(nameInput.scrollWidth, 130)}px`;
		}

		setPreviewColor();

		// focus nameInput whenever its rendered on screen
		if (nameInput) nameInput.focus();
	});
</script>

{#snippet previewTip()}
	<div
		class="{topBorderColor} border-t-22 border-r-22 border-l-22
				border-r-transparent border-l-transparent"
	></div>
{/snippet}

{#snippet formButton(text: string, type: 'fw' | 'bw', disabled?: boolean, disableTitle?: string)}
	<button
		type="button"
		onclick={() => (type === 'fw' ? nextStep() : prevStep())}
		class={buttonStyle}
		class:disabled
		title={type === 'fw' ? (disabled ? disableTitle : text) : ''}
		{disabled}>{text}</button
	>
{/snippet}

<Modal bind:open>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="animate-slide-right flex h-[70dvh] flex-col items-center justify-between gap-5"
		onclick={() => (open = false)}
	>
		<!-- Modal body -->

		<div class="flex flex-1 items-center justify-center">
			<div class="flex flex-col items-center gap-5" onclick={(e) => e.stopPropagation()}>
				{#if currentStep === 'Name'}
					<!-- Name -->
					<div class="flex flex-1 flex-col items-center justify-center">
						<input
							bind:this={nameInput}
							bind:value={name}
							type="text"
							maxlength={25}
							autocomplete="off"
							placeholder="Start with a name..."
							class="{previewStyle} bg-{color ?? 'slate-900'}"
							oninput={(e) => handleInput(e)}
							onkeydown={(e) => (e.key === 'Enter' ? nextStep() : null)}
						/>
						{@render previewTip()}
					</div>
				{:else if currentStep === 'Color'}
					<!-- Color -->
					<div class="flex flex-col items-center">
						<div class="{previewStyle} bg-{color ?? 'slate-900'} min-w-32.5">
							{name}
						</div>
						{@render previewTip()}
					</div>
					<div class="grid grid-cols-[repeat(5,1fr)] place-items-center gap-2">
						{#each twColors as twColor}
							{#each { length: 5 } as _, i}
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
				{:else if currentStep === 'Coordinates'}
					<!-- Submit -->
					<div class="w-[90dvw] sm:w-[75dvw] lg:w-[56dvw]">
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
				{:else if currentStep === 'Submit'}
					<div class="flex flex-col items-center gap-15">
						<div class="flex flex-1 flex-col items-center justify-center">
							<div class="{previewStyle} flex bg-{color ?? 'gray-900'}">Create Journey?</div>
							{@render previewTip()}
						</div>
						<form
							action="?/addJourney"
							method="POST"
							class="flex flex-row items-center gap-2 whitespace-nowrap"
							bind:this={form}
						>
							<input name="name" value={name} type="hidden" />
							<input name="color" value={color} type="hidden" />
							<input name="lng" value={lng} type="hidden" />
							<input name="lat" value={lat} type="hidden" />
						</form>
					</div>
				{/if}
			</div>
		</div>
		<div
			class="flex w-full justify-center gap-2 whitespace-nowrap"
			onclick={(e) => e.stopPropagation()}
		>
			{#if currentStep === 'Name'}
				{@render formButton('Cancel', 'bw')}
				{@render formButton('Choose Color', 'fw', !name, 'Enter a name first!')}
			{/if}
			{#if currentStep === 'Color'}
				{@render formButton('Edit Name', 'bw')}
				{@render formButton('Choose Location', 'fw', !color, 'Choose a color first!')}
			{/if}
			{#if currentStep === 'Coordinates'}
				{@render formButton('Change Color', 'bw')}
				{@render formButton('Submit', 'fw', !lng || !lat, 'Choose a location first!')}
			{/if}
			{#if currentStep === 'Submit'}
				{@render formButton('Cancel', 'bw')}
				{@render formButton('Confirm', 'fw', !name || !color || !lng || !lat)}
			{/if}
		</div>
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

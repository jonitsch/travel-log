<script lang="ts">
	import { global } from '$lib/state.svelte';
	import { MapLibre } from 'svelte-maplibre';
	import JourneyMarker from './JourneyMarker.svelte';
	import Modal from './Modal.svelte';

	let modal = $state<Modal>(),
		form = $state<HTMLFormElement>(),
		map = $state<maplibregl.Map>();

	let open = $state(false),
		currentStep = $state<'Name' | 'Color' | 'Coordinates' | 'Submit'>('Name');

	const twColors = ['red', 'yellow', 'emerald', 'blue', 'purple', 'pink'];
	const buttonStyle =
		'rounded-md border-b-4 border-b-gray-700 bg-gray-900 p-5 sm:text-4xl transition hover:-translate-y-1';

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
	export async function close() {
		open = false;
	}
	export function reset() {
		name = '';
		lng = undefined;
		lat = undefined;
		color = undefined;
	}

	$effect(() => {
		color;
		setPreviewColor();
	});

	export function handleSubmit() {
		console.log('handleSubmit');
		if (currentStep === 'Name') {
			currentStep = 'Color';
		} else if (currentStep === 'Color') {
			currentStep = 'Coordinates';
		} else if (currentStep === 'Coordinates') {
			currentStep = 'Submit';
		}
	}

	$effect(() => {
		// focus nameInput whenever its rendered on screen
		if (nameInput) nameInput.focus();
	});
</script>

<Modal bind:this={modal} bind:open>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="h-fit w-fit" onclick={(e) => e.stopPropagation()}>
		<div
			onsubmit={(e) => {
				if (currentStep !== 'Submit') {
					e.preventDefault();
					handleSubmit();
				}
			}}
			class="flex h-full flex-col items-center"
		>
			<div class="flex h-full flex-col items-center justify-center rounded-md p-8">
				<div class="animate-slide-right w-full overflow-auto rounded-md px-6 py-4 text-white">
					<!-- Modal body -->
					<div class="mb-10 flex flex-col items-center">
						{#if currentStep === 'Name'}
							<!-- Name -->
							<div class="flex flex-col items-center gap-30">
								<div class="flex flex-col items-center">
									<input
										bind:this={nameInput}
										bind:value={name}
										required
										type="text"
										maxlength={25}
										autocomplete="off"
										placeholder="Start with a name..."
										class="field-sizing-content rounded-md border-b-4 border-b-black/80 {color
											? `bg-${color}`
											: 'bg-slate-900'}
													px-3 py-2 text-center text-6xl text-white opacity-100"
										oninput={(e) => {
											const target = e.currentTarget as HTMLInputElement;
											if (e.currentTarget.value.length > 0) {
												target.style.width = '0px';
												target.style.width = `${Math.max(target.scrollWidth, 130)}px`;
											} else {
												target.style.width = 'auto';
											}
										}}
										onkeydown={(e) => {
											if (e.key === 'Enter') handleSubmit();
										}}
									/>
									<div
										class="{topBorderColor} border-t-36 border-r-36 border-l-36
													border-r-transparent border-l-transparent"
									></div>
								</div>
								<button
									type="button"
									onclick={() => handleSubmit()}
									class={buttonStyle}
									class:disabled={name.length === 0}
									disabled={name.length === 0}>Confirm</button
								>
							</div>
						{:else if currentStep === 'Color'}
							<!-- Color -->
							<div class="flex flex-col items-center gap-10">
								<div class="flex flex-col items-center gap-5">
									<div class="flex flex-col items-center">
										<div
											class="w-fit rounded-md border-b-4 border-b-black/40 bg-{color ??
												'slate-900'} px-3 py-2 text-center text-6xl text-white opacity-75"
										>
											{name}
										</div>
										<div
											class="{topBorderColor} border-t-36 border-r-36 border-l-36
													border-r-transparent border-l-transparent"
										></div>
									</div>
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
												onclick={(e) => {
													color = currentColor;
												}}
												type="button"
												title={currentColor}
											></button>
										{/each}
									{/each}
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
							</div>
						{:else if currentStep === 'Coordinates'}
							<!-- Submit -->
							<div class="flex max-h-[80dvh] w-[70dvw] flex-col items-center gap-2">
								<input name="lng" bind:value={lng} type="hidden" />
								<input name="lng" bind:value={lat} type="hidden" />
								<MapLibre
									bind:map
									style="https://tiles.openfreemap.org/styles/liberty"
									class="map-canvas aspect-9/16 size-full rounded-md"
									onclick={(e) => {
										if (!map) throw Error('Click on CreateJourneyModal-Map: Map not defined!');
										lng = e.lngLat.lng;
										lat = e.lngLat.lat;
									}}
									center={[0, 30]}
								>
									{#if lng && lat && color}
										<JourneyMarker lngLat={[lng, lat]} popupText={name} {color} open />
									{/if}
								</MapLibre>
								<div class="flex w-full justify-between gap-2 whitespace-nowrap">
									<button
										type="button"
										onclick={() => (currentStep = 'Color')}
										class="{buttonStyle} flex-1"
									>
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
							</div>
						{:else if currentStep === 'Submit'}
							<div class="mb-10 flex text-8xl">Create Journey?</div>
							<form
								bind:this={form}
								action="?/addJourney"
								method="POST"
								class="flex h-full flex-row items-center gap-2 whitespace-nowrap"
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
				</div>
			</div>
		</div>
	</div>
</Modal>

<style>
	.disabled {
		filter: grayscale(90%);
		color: rgb(87, 87, 87);
		translate: none;
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

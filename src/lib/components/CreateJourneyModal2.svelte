<script lang="ts">
	import { global } from '$lib/state.svelte';

	let modal = $state<HTMLDivElement>(),
		form = $state<HTMLFormElement>();

	let isModalOpen = $state(true),
		currentStep = $state<'Name' | 'Color' | 'Coordinates' | 'Submit'>('Name');

	const twColors = ['red', 'yellow', 'emerald', 'blue', 'purple', 'pink'];
	const buttonStyle =
		'rounded-md border-b-4 border-b-gray-700 bg-gray-900 p-5 text-4xl transition hover:-translate-y-1';

	let selectedColorElement = $state<HTMLButtonElement>(),
		nameInput = $state<HTMLInputElement>(),
		colorInput = $state<HTMLInputElement>();

	let name = $state(''),
		lng = $state<number>(),
		lat = $state<number>(),
		color = $state<string>();

	export async function toggle() {
		isModalOpen = !isModalOpen;
	}
	function setPreviewColor() {
		if (selectedColorElement && colorInput) {
			const currentColor = window.getComputedStyle(selectedColorElement).backgroundColor;
			colorInput.style.background = currentColor;
			colorInput.style.color = 'white';
		}
	}

	export async function close() {
		isModalOpen = false;
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
		console.log('handleSubmit')
		if (currentStep === 'Name') {
			currentStep = 'Color';
		} else if (currentStep === 'Color') {
			currentStep = 'Coordinates';
			global.viewMode = 'createJourney';
			global.map?.on('click', (e) => {
				lng = e.lngLat.lng;
				lat = e.lngLat.lat;
				console.log(lng, lat);
			});
			close();
		} else if (currentStep === 'Coordinates') {
			console.log('sumbitted');
			currentStep = 'Submit';
			form?.requestSubmit();
		}
	}

	$inspect(currentStep);
</script>

{#if isModalOpen && global.viewMode === 'overview'}
	<!-- Modal container -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-9999 flex h-dvh w-dvw cursor-default justify-center gap-5 bg-black/90 p-5"
		onclick={() => close()}
	>
		<div id="modal" bind:this={modal} class="h-full w-fit" onclick={(e) => e.stopPropagation()}>
			<form
				bind:this={form}
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
					if (currentStep === 'Submit') e.currentTarget.submit();
				}}
				action="?/addJourney"
				method="POST"
				class="flex h-full flex-col items-center"
			>
				<div class="flex h-full flex-col items-center justify-center p-10">
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
											name="name"
											type="text"
											autocomplete="off"
											placeholder="Start with a name..."
											class="w-fit rounded-md border-b-4 border-b-slate-700 bg-slate-900 px-3 py-2 text-center text-6xl text-white opacity-75"
											oninput={(e) => {
												if (e.currentTarget.value.length > 0) {
												}
											}}
											onsubmit={() => (currentStep = 'Color')}
										/>
										<div
											class="border-t-36 border-r-36 border-l-36 border-t-slate-700 border-r-transparent border-l-transparent opacity-75"
										></div>
									</div>
									<button
										type="submit"
										class={buttonStyle}
										class:disabled={name.length === 0}
										disabled={name.length === 0}>Confirm</button
									>
								</div>
							{:else if currentStep === 'Color'}
								{console.log('test')}
								<!-- Color -->
								<div class="flex flex-col items-center gap-10">
									<div class="flex flex-col items-center gap-5">
										<div class="flex flex-col items-center">
											<div
												class="w-fit rounded-md border-b-4 border-b-{color ??
													'slate-900'} bg-{color ??
													'slate-900'} px-3 py-2 text-center text-6xl text-white opacity-75"
											>
												{name}
											</div>
										</div>

										<input
											bind:value={color}
											bind:this={colorInput}
											name="color"
											type="hidden"
											readonly
											required
										/>
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
										<button type="submit" class={buttonStyle}>Choose Location</button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.disabled {
		filter: grayscale(90%);
		color: rgb(87, 87, 87);
		translate: none;
	}
	.selected {
		border: solid 3px #000000;
		transform: scale(130%);
	}

	input:focus {
		outline: none !important;
		box-shadow: none !important; /* emerald focus ring */
	}
	input:focus-visible {
		outline: none !important;
	}
</style>

<script lang="ts">
	let isModalOpen = $state(false);

	const twColors = ['red', 'yellow', 'green', 'blue', 'purple', 'pink'];
	const inputStyle =
		'text-gray-900 w-full rounded-md border border-gray-300 px-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
	const labelStyle = 'mb-1 block text-sm font-medium text-gray-200';

	let selectedColorElement = $state<HTMLButtonElement>(),
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

	$effect(() => {
		color;
		setPreviewColor();
	});
</script>

{#if isModalOpen}
	<!-- Modal container -->
	<div
		class="animate-slide w-full max-w-sm overflow-auto rounded-md bg-gray-900 px-6 py-4 text-white"
	>
		<div class="mb-4 flex flex-row">
			<!-- Modal header -->
			<h2 class="flex-1 text-xl font-semibold">Create new Journey</h2>
			<!-- Close button -->
			<button
				class="text-xl text-gray-400 hover:text-gray-600"
				aria-label="Close"
				onclick={() => (isModalOpen = false)}
			>
				✕
			</button>
		</div>

		<!-- Modal body -->
		<form class="space-y-4" method="POST" action="?/addJourney">
			<!-- Name -->
			<div>
				<label for="name" class={labelStyle}> Name </label>
				<input
					bind:value={name}
					required
					name="name"
					type="text"
					placeholder="Enter location name"
					class={inputStyle}
				/>
			</div>

			<!-- Longitude -->
			<div>
				<label for="lng" class={labelStyle}> Longitude </label>
				<input
					bind:value={lng}
					required
					name="lng"
					type="number"
					step={0.01}
					min={-180}
					max={180}
					placeholder="e.g. 120.9822"
					class={inputStyle}
					oninput={(e) => {
						const target = e.currentTarget;
						const val: number = target.valueAsNumber;
						if (val.toString() === 'NaN') target.setCustomValidity('Please enter a valid number!');
						if (val > 180 || val < -180)
							target.setCustomValidity('The longitude needs to be between 0-180!');
						else target.setCustomValidity('');
						target.reportValidity();
					}}
				/>
			</div>

			<!-- Latitude -->
			<div>
				<label for="lat" class={labelStyle}> Latitude </label>
				<input
					bind:value={lat}
					required
					name="lat"
					type="number"
					step={0.01}
					min={-90}
					max={90}
					placeholder="e.g. 14.6042"
					class={inputStyle}
				/>
			</div>

			<!-- Color -->
			<div>
				<label for="color" class={labelStyle}> Color </label>
				<input
					bind:value={color}
					bind:this={colorInput}
					name="color"
					placeholder="Select a color"
					type="text"
					readonly
					required
					class="pointer-events-none w-full rounded-md border border-gray-300 bg-{color ?? 'gray-200'} px-3 py-1 text-gray-900"
					onload={() => setPreviewColor()}
				/>
			</div>
			<div class="grid grid-cols-[repeat(5,1fr)] place-items-center gap-2">
				{#each twColors as twColor}
					{#each { length: 5 } as el, i}
						{@const currentColor = `${twColor}-${900 - i * 100}`}
						<button
							id={currentColor}
							class="bg-{currentColor} size-8 cursor-pointer rounded-full transition duration-100 ease-in-out hover:scale-[120%]"
							aria-label="Select color {currentColor}"
							onclick={(e) => {
								if (selectedColorElement) selectedColorElement.classList.remove('selected');
								selectedColorElement = e.currentTarget;
								console.log(selectedColorElement.style.background);
								selectedColorElement.classList.add('selected');
								color = currentColor;
							}}
							type="button"
							title={currentColor}
						></button>
					{/each}
				{/each}
			</div>

			<!-- Modal footer -->
			<div class="flex justify-end space-x-3">
				<button
					class="rounded bg-gray-100 px-4 py-2 text-gray-900 hover:bg-gray-200"
					onclick={() => (isModalOpen = false)}
					type="reset"
				>
					Cancel
				</button>
				<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" type="submit">
					Confirm
				</button>
			</div>
		</form>
	</div>
{/if}

<style>
	input:invalid {
		border: red 2px solid;
	}
	.selected {
		border: solid 3px #000000;
		transform: scale(130%);
	}
</style>

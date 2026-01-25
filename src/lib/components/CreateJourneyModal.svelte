<script lang="ts">
	let isModalOpen = $state(true);
	const colors = ['red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];
	const inputStyle='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
	const labelStyle='mb-1 block text-sm font-medium text-gray-700';
	let selectedColor = $state<string>();
	let selectedColorElement = $state<HTMLButtonElement>();

	export async function openModal() {
		isModalOpen = true;
	}
	// svelte-ignore non_reactive_update
	let modal: HTMLDivElement;
</script>

{#if isModalOpen}
	<!-- Backdrop -->
	<div
		bind:this={modal}
		class="absolute inset-0 z-[15000] flex items-center justify-center bg-black/50"
	>
		<!-- Modal container -->
		<div class="fixed mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<!-- Close button -->
			<button
				class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
				aria-label="Close"
				onclick={() => (isModalOpen = false)}
			>
				✕
			</button>

			<!-- Modal header -->
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Create a new Journey</h2>

			<!-- Modal body -->
			<form class="space-y-4" method="POST" action="?/addJourney">
				<!-- Name -->
				<div>
					<label for="name" class={labelStyle}> Name </label>
					<input
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
						required
						name="lng"
						type="number"
						step={0.01}
						min={0}
						max={180}
						placeholder="e.g. 120.9822"
						class={inputStyle}
						oninput={(e) => {
							const target = e.currentTarget;
							const val: number = target.valueAsNumber;
							console.log(val.toString())
							if (val.toString() === 'NaN') target.setCustomValidity('Please enter a valid number!');
							if(val > 180 || val < 0) target.setCustomValidity('The longitude needs to be between 0-180!');
							else  target.setCustomValidity('');
							target.reportValidity();
						}}
					/>
				</div>

				<!-- Latitude -->
				<div>
					<label for="lat" class={labelStyle}> Latitude </label>
					<input
						required
						name="lat"
						type="number"
						placeholder="e.g. 14.6042"
						class={inputStyle}
						oninput={(e) => {
							const target = e.currentTarget;
							const val: number = target.valueAsNumber;
							console.log(val.toString())
							if (val.toString() === 'NaN') target.setCustomValidity('Please enter a valid number!');
							if(val > 180 || val < 0) target.setCustomValidity('The longitude needs to be between 0-180!');
							else  target.setCustomValidity('');
							target.reportValidity();
						}}
					/>
				</div>

				<!-- Color -->
				<div>
					<label for="color" class={labelStyle}> Color </label>
					<input required name="color" bind:value={selectedColor} type="hidden" />
				</div>
				<div class="grid grid-cols-[repeat(6,1fr)] gap-2 place-items-center">
					{#each colors as color}
						{#each { length: 6 } as el, i}
							{@const currentColor = `${color}-${900 - i * 100}`}
							<button
								id={currentColor}
								class="bg-{currentColor} size-10 cursor-pointer rounded-full hover:ring-2 hover:ring-gray-900"
								aria-label="Select color {currentColor}"
								onclick={(e) => {
									if (selectedColorElement) selectedColorElement.style.border = '';
									selectedColor = currentColor;
									selectedColorElement = e.currentTarget;
									selectedColorElement.style.border = 'solid #111827 4px';
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

		<!-- Modal body -->
		<form class="space-y-4" method="POST">
			<!-- Name -->
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-200"> Name </label>
				<input id="name" type="text" placeholder="Enter journey name" class="inputField" />
			</div>

			<!-- Longitude -->
			<div>
				<label for="lng" class="mb-1 block text-sm font-medium text-gray-200"> Longitude </label>
				<input id="lng" type="float" placeholder="e.g. 120.9822" class="inputField" />
			</div>

			<!-- Latitude -->
			<div>
				<label for="lat" class="mb-1 block text-sm font-medium text-gray-200"> Latitude </label>
				<input id="lat" type="float" placeholder="e.g. 14.6042" class="inputField" />
			</div>
			<!-- Color -->
			<div class="grid">

			</div>

			<!-- Modal footer -->
			<div class="flex justify-end space-x-3">
				<button
					class="rounded bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
					type="reset"
					onclick={() => (isModalOpen = false)}
				>
					Cancel
				</button>
				<button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
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
</style>

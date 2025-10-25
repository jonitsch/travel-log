<script lang="ts">
	let isModalOpen = $state(false);
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
		class="absolute inset-0 z-15000 flex items-center justify-center bg-black/50"
	>
		<!-- Modal container -->
		<div class="fixed mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<!-- Close button -->
			<button
				class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
				aria-label="Close"
				onclick={() => (isModalOpen = false)}
			>
				✕
			</button>

			<!-- Modal header -->
			<h2 class="mb-4 text-xl font-semibold text-gray-800">Create a new Journey</h2>

			<!-- Modal body -->
			<form class="space-y-4" method='POST' action="?/addJourney">
				<!-- Name -->
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Name </label>
					<input
						id="name"
						type="text"
						placeholder="Enter location name"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<!-- Longitude -->
				<div>
					<label for="lng" class="mb-1 block text-sm font-medium text-gray-700"> Longitude </label>
					<input
						id="lng"
						type="float"
						placeholder="e.g. 120.9822"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<!-- Latitude -->
				<div>
					<label for="lat" class="mb-1 block text-sm font-medium text-gray-700"> Latitude </label>
					<input
						id="lat"
						type="float"
						placeholder="e.g. 14.6042"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<!-- Modal footer -->
				<div class="flex justify-end space-x-3">
					<button
						class="rounded bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
						onclick={() => (isModalOpen = false)}
					>
						Cancel
					</button>
					<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
						Confirm
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

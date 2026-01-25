<script lang="ts">
	let isModalOpen = $state(true);
	export async function open() {
		isModalOpen = true;
	}
</script>

{#if isModalOpen}
	<!-- Modal container -->
	<div class="animate-slide w-full max-w-sm flex-[0.5] rounded-md bg-gray-900 p-6 text-white">
		<div class="flex flex-row mb-4">
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

<script lang="ts">
    let { color = $bindable() }: { color: string | undefined } = $props();

	const twColors = ['red', 'yellow', 'emerald', 'blue', 'purple', 'pink'];
</script>

<div class="grid grid-cols-[repeat(5,1fr)] place-items-center gap-2">
	{#each twColors as twColor}
		{#each { length: 5 } as _, i}
			{@const currentColor = `${twColor}-${900 - i * 100}`}
			<button
				id={currentColor}
				class="bg-{currentColor} size-12 rounded-full transition duration-100 ease-in-out hover:scale-[120%]"
				aria-label="Select color: {currentColor}"
				title="Select color: {currentColor}"
				class:selected={currentColor === color}
				onclick={() => (color = currentColor)}
				type="button"
			></button>
		{/each}
	{/each}
</div>

<style>
	.selected {
		box-shadow: inset 0px 0px 0px 4px #0000009e;
		transform: scale(1.4);
	}
</style>

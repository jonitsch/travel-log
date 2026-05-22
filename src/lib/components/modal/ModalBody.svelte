<script lang="ts">
	import type { Snippet } from 'svelte';
	import SVGIcon from '../SVGIcon.svelte';

	let {
		children,
		open = $bindable(),
		hideCloseButton = false
	}: { children: Snippet; open: boolean; hideCloseButton?: boolean } = $props();
</script>

<div class="max-w-90dvw relative border-b-3 border-b-gray-950 bg-slate-900 opacity-70 rounded-md p-5">
	{#if !hideCloseButton}
		<button
			type="button"
			class="absolute top-1 right-1 z-99 flex size-8 items-center justify-center rounded-full p-2 text-white/70 hover:bg-white/10"
			aria-label="Close modal"
			onclick={() => (open = false)}
		>
			<SVGIcon type="x" color="white" scale={0.8} />
		</button>
	{/if}

	{@render children?.()}
</div>

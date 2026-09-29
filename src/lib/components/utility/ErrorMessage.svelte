<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, error }: { children?: Snippet; error?: unknown } = $props();
</script>

<div class="items-center rounded-md bg-red-950 p-3 align-middle text-white">
	<div class="oxygen-bold text-2xl">
		{@render children?.()}
	</div>
	<br />
	{#if error}
		<text class="text-1xl oxygen-light">{error}</text>
	{/if}
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { global } from '$lib/state.svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		slide = 'right',
		...rest
	}: { children?: Snippet; slide?: 'left' | 'right' } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class="animate-slide-{slide} flex h-fit flex-col justify-between {global.loadingJourney
		? 'gap-2 *:skeleton'
		: '*:text-white'}"
	{...rest}
>
	{@render children?.()}
</div>

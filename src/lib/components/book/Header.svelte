<script lang="ts">
	import type { Snippet } from 'svelte';
	import { global } from '$lib/state.svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		headerText,
		buttons,
		slideDir = 'right',
		...rest
	}: {
		headerText: Snippet;
		buttons?: Snippet;
		slideDir?: 'left' | 'right';
	} & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class="animate-slide-{slideDir} flex h-fit flex-col justify-between {global.loadingJourney
		? 'gap-2 *:skeleton'
		: '*:text-white'}"
	{...rest}
>
	<div class="oxygen-bold flex flex-row items-end gap-2 pb-2 text-5xl">
		{@render headerText()}
	</div>
	<div
		class="flex flex-row justify-between *:flex *:items-center *:gap-1 {global.loadingJourney
			? 'w-fit'
			: 'w-full'}"
	>
		{@render buttons?.()}
	</div>
</div>

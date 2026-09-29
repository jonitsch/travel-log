<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { slide } from 'svelte/transition';

	type Props = {
		content: Snippet;
		hoveredContent?: Snippet;
		anchor: 'left' | 'right';
	} & HTMLButtonAttributes;

	let hovered = $state(false);
	let { hoveredContent, content, anchor, ...rest }: Props = $props();
</script>

<button
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
	{...rest}
	class="custom-hover-btn button-hover cursor-pointer rounded-md bg-gray-900 p-1"
>
	<div class="flex size-full flex-row items-center gap-1 whitespace-nowrap">
		{#if hovered && anchor === 'right'}
			<div transition:slide={{ axis: 'x' }} class="px-1">
				{@render hoveredContent?.()}
			</div>
		{/if}
		{@render content()}
		{#if hovered && anchor === 'left'}
			<div transition:slide={{ axis: 'x' }} class="h-fit px-1">
				{@render hoveredContent?.()}
			</div>
		{/if}
	</div>
</button>

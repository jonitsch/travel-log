<script lang="ts">
	import type { Snippet } from 'svelte';
	import SVGIcon, { type iconType } from '../utility/SVGIcon.svelte';

	let {
		children,
		open = $bindable(),
		showCloseButton = true,
		title,
		icon
	}: {
		children: Snippet;
		open: boolean;
		showCloseButton?: boolean;
		title?: string;
		icon?: iconType;
	} = $props();
</script>

<div
	class="max-w-90dvw relative rounded-md border-b-3 border-b-gray-950 bg-slate-900 p-5 opacity-70"
>
	{#if showCloseButton}
		<button
			type="button"
			class="absolute top-1 right-1 z-99 flex size-8 items-center justify-center rounded-full p-2 text-white/70 hover:bg-white/10"
			aria-label="Close modal"
			onclick={() => (open = false)}
		>
			<SVGIcon type="x" color="white" scale={0.8} />
		</button>
	{/if}
	<div class="flex w-fit h-fit flex-col items-center justify-center gap-5">
		<div class="flex flex-row items-center gap-1">
			{#if title}<span class="text-4xl">{title}</span>{/if}
			{#if icon}<SVGIcon type={icon} color="white" scale={2.5} hoverScale={false} />{/if}
		</div>
		{@render children?.()}
	</div>
</div>

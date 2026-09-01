<script lang="ts">
	import type { Snippet } from 'svelte';
	import SVGIcon, { type iconType } from '../utility/SVGIcon.svelte';

	let {
		children,
		subHeader,
		open = $bindable(),
		showCloseButton = true,
		title,
		icon,
		alignment = 'row',
		iconScale
	}: {
		children: Snippet;
		subHeader?: Snippet;
		open: boolean;
		showCloseButton?: boolean;
		title?: string;
		icon?: iconType;
		alignment?: 'row' | 'col';
		iconScale?: number;
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
	<div class="flex h-fit w-fit flex-col gap-5">
		<div class="flex flex-col gap-3 items-center">
			<div class="flex flex-{alignment} items-center gap-1">
				{#if alignment === 'row'}
					{#if title}<span class="text-4xl">{title}</span>{/if}
					{#if icon}<SVGIcon
							type={icon}
							color="white"
							scale={iconScale ?? 2.5}
							hoverScale={false}
						/>{/if}
				{/if}
				{#if alignment === 'col'}
					{#if icon}<SVGIcon
							type={icon}
							color="white"
							scale={iconScale ?? 3.5}
							hoverScale={false}
						/>{/if}
					{#if title}<span class="text-4xl">{title}</span>{/if}
				{/if}
			</div>
			{#if subHeader}
				<p class="w-full text-center text-sm text-slate-300">
					{@render subHeader()}
				</p>
			{/if}
		</div>
		{@render children?.()}
	</div>
</div>

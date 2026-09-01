<script lang="ts">
	import { global } from '$lib/state.svelte';
	import SVGIcon, { type iconType } from '$lib/components/utility/SVGIcon.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	type Props = {
		type?: iconType;
		text?: string;
        title?: string;
		onclick?: () => void;
		disabled?: boolean;
		scale?: number;
		color?: string;
		className?: string;
		collapseOnMobile?: boolean;
        iconAnchor?: 'left' | 'right';
	};

	let {
		type,
		text,
        title,
		onclick,
		disabled = false,
		scale,
		color,
		className = '',
		collapseOnMobile = true,
        iconAnchor = 'left'
	}: Props = $props();
</script>

<button
	class={[
		`flex w-fit button-hover flex-row items-center gap-1 rounded-md p-1 disabled:cursor-auto! disabled:opacity-50 ${className}`,
		{ 'hover:bg-gray-900': !global.loadingJourney },
		{ 'bg-gray-900': global.imgSelectMode && type === 'selectImages' && !global.loadingJourney },
		{ '*:invisible': global.loadingJourney }
	]}
	{onclick}
	{disabled}
    {title}
>
	{#if type && iconAnchor === 'left'}
		<SVGIcon {type} hoverScale={false} scale={scale ?? 0.85} {color} />
	{/if}
	{#if text && ((innerWidth.current && innerWidth.current > 1150) || !collapseOnMobile)}
		<div>{text}</div>
	{/if}
    {#if type && iconAnchor === 'right'}
		<SVGIcon {type} hoverScale={false} scale={scale ?? 0.85} {color} />
	{/if}
</button>

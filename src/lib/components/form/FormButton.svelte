<script lang="ts">
	import { Button } from '$lib/components/shadcn/button';
	import SVGIcon from '$lib/components/utility/SVGIcon.svelte';

	type FormButtonVariant = 'confirm' | 'cancel' | 'delete';

	type Props = {
		variant: FormButtonVariant;
		type?: 'button' | 'submit';
		label?: string;
		onclick?: () => void;
		disabled?: boolean;
		loading?: boolean;
		class?: string;
	};

	let {
		variant,
		type = 'button',
		label,
		onclick,
		disabled = false,
		loading = false,
		class: className = ''
	}: Props = $props();

	const variantClass = {
		confirm: 'bg-green-600 hover:bg-green-500',
		delete: 'bg-red-700 hover:bg-red-600 text-white',
		cancel: ''
	};
</script>

<Button {type} {onclick} {disabled} class={`${variantClass[variant]} ${className}`}>
	{#if loading}
		<SVGIcon type="spinner" fill="none" />
	{:else}
		{label ?? (variant === 'confirm' ? 'Confirm' : variant === 'cancel' ? 'Cancel' : 'Delete')}
	{/if}
</Button>

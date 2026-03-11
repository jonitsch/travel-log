<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';

	let {
		children,
		open = $bindable(),
		onclose
	}: { children: Snippet; open: boolean; onclose?: () => void } = $props();

	let modal = $state<HTMLDivElement>();

	$effect(() => {
		if (open) {
			modal?.focus();
		} else if (onclose) {
			onclose();
		}
	});
</script>

{#if open}
	<!-- Modal Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={modal}
		id="modalBackdrop"
		role="dialog"
		tabindex="0"
		class="fixed inset-0 z-9999 flex h-dvh w-dvw cursor-default items-center justify-center gap-5 bg-black/90"
		onclick={() => (open = false)}
		onkeydown={(e) => {
			if (e.key === 'Escape') open = false;
		}}
	>
		<div id="modalContent" class="animate-modal-in" onclick={(e) => e.stopPropagation()}>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	div:focus {
		outline: none !important;
		box-shadow: none !important; /* emerald focus ring */
	}
	div:focus-visible {
		outline: none !important;
	}
</style>

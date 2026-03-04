<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, open = $bindable() }: { children: Snippet; open: boolean } = $props();
</script>

{#if open}
	<!-- Modal Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		id="modal"
		class="fixed inset-0 z-9999 flex h-dvh w-dvw cursor-default items-center justify-center gap-5 bg-black/90"
		onclick={() => (open = false)}
	>
		<div id="modalContent" onclick={(e) => e.stopPropagation()}>
			{@render children?.()}
		</div>
	</div>
{/if}

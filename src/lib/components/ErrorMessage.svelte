<script lang="ts">
	let { children, error } = $props();
</script>

<div class="items-start h-fit w-fit rounded-md bg-red-950 p-3 text-white whitespace-nowrap">
	<text class="text-2xl oxygen-bold">
		{@render children?.()}
	</text>
	<br />
	<text class="text-1xl oxygen-light">{error}</text>
</div>

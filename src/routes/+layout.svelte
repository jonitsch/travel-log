<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles.css';
	import { browser } from '$app/environment';

	let { children } = $props();
	let displayMode: string | undefined = $state('');

	if (browser) {
		displayMode = document.getElementById('html')?.className;
	}

	function switchLightMode() {
		let html = document.getElementById('html');
		if (html) {
			html.className = html.className == 'dark' ? 'light' : 'dark';
			displayMode = html.className;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="main" class="absolute h-full w-full overflow-hidden p-5">
	<div id="content" class="absolute inset-0 z-0 h-full w-full">
		{@render children?.()}
	</div>
	<div id="header" class="z-[1500000] fixed bg-transparent w-fit top-[15px] left-[15px] items-center">
			<button id="headerText" class="oxygen-bold shadow-xl w-fit rounded-md bg-gray-900 p-3 text-gray-50 leading-tight text-3xl">
				Travel Log
			</button>
		<div class="group font-xs m-1 ml-1 w-fit text-gray-500">
			Für Tamina und Joni
			<text class="invisible ml-1 text-red-400 group-hover:visible">♥</text>
		</div>
	</div>
</div>

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
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
	<div
		class="z-999999999 group absolute top-[65px] m-1 ml-1 w-fit cursor-grab text-[11px] text-transparent"
	>
		Für Tamina und Joni
		<text id="heart" class="invisible ml-0.5 cursor-pointer text-red-400 group-hover:visible"
			>♥</text
		>
	</div>
	<div id="content" class="absolute inset-0 z-0 h-full w-full">
		{@render children?.()}
	</div>
	<div id="header" class="absolute w-fit items-center bg-transparent">
		<button
			id="headerText"
			class="oxygen-bold text-1xl w-fit rounded-md bg-gray-900 p-3 leading-tight text-gray-50 shadow-xl"
		>
			Travel Log
		</button>
		<div class="group m-1 ml-1 w-fit text-[11px] text-gray-500">Für Tamina und Joni</div>
	</div>
</div>

import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot  } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
		sveltekit(),
		devtoolsJson(),
		tailwindcss()
	],
	server: {
		fs: {
		allow: [
			searchForWorkspaceRoot(process.cwd()),
			'C:/git/travel-log/pictures/dolomites2025',
		],
		},
	},
});

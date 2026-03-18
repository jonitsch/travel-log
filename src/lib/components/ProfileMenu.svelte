<script lang="ts">
	import SVGIcon from './SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';

	import * as DropdownMenu from '$lib/components/shadcn/dropdown-menu/index';

	let { name }: { name: string } = $props();

	let open = $state(false);

	async function handleSignOut() {
		try {
			global.viewMode = 'overview';
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						await invalidateAll();
						goto('/');
					}
				}
			});
		} catch (err) {
			throw err;
		}
	}
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		<div
			id="viewProfileButton"
			class={["page-header-button flex flex-row gap-2 w-fit items-center bg-gray-900 py-1 px-3",
				{ 'ring-[#ffffff1a] ring-2': open }
			]}
		>
			{name} <SVGIcon type="profilePic" scale={1.1} />
		</div>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="bg-gray-900 w-60 mt-0.5" align="end">
		<DropdownMenu.Group class="*:text-[16px]">
			<DropdownMenu.Item>
				<SVGIcon type="profilePic" color="white" hoverScale={false} />
				Change Profile Picture
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={handleSignOut}>
				<SVGIcon type="signOut" color="white" hoverScale={false} />
				Sign Out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

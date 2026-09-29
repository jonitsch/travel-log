<script lang="ts">
	import SVGIcon from './utility/SVGIcon.svelte';
	import { global } from '$lib/state.svelte';
	import { authClient } from '$lib/auth-client';
	import { goto, invalidateAll } from '$app/navigation';
	import WhatsNewModal from '$lib/components/modal/WhatsNewModal.svelte';

	import * as DropdownMenu from '$lib/components/shadcn/dropdown-menu/index';
	import { toastFailure } from '$lib/utils/client';

	let { name }: { name: string } = $props();

	let open = $state(false);
	let whatsNewModal = $state<WhatsNewModal>();

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
			toastFailure('Something went wrong!');
			console.error(`Failed to sign out: ${err}`);
			throw err;
		}
	}
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		<div
			id="viewProfileButton"
			class={[
				'flex page-header-button w-fit flex-row items-center gap-2 bg-gray-900 px-3 py-1',
				{ 'ring-2 ring-[#ffffff1a]': open }
			]}
		>
			{name}
			<SVGIcon type="profile" scale={1.1} />
		</div>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="mt-0.5 w-fit bg-gray-900" align="end">
		<DropdownMenu.Group class="*:text-[16px]">
			<DropdownMenu.Item onclick={() => whatsNewModal?.openModal()}>
				<SVGIcon type="lightBulb" color="white" hoverScale={false} />
				What's New
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={handleSignOut}>
				<SVGIcon type="signOut" color="white" hoverScale={false} />
				Sign Out
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<WhatsNewModal bind:this={whatsNewModal} />

<script lang="ts">
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
		on:click={close}
		on:keydown={(e) => e.key === 'Escape' && close()}
		role="button"
		tabindex="0"
		aria-label="Close menu"
	/>

	<!-- Mobile Menu -->
	<nav
		class="fixed top-[72px] left-0 right-0 bg-grey-800 shadow-lg z-50 md:hidden border-t border-grey-600"
	>
		<div class="container mx-auto px-4 py-6">
			<div class="flex flex-col gap-4">
				<a
					href="/"
					class="text-white font-sans uppercase text-base tracking-wide hover:text-pii-cyan transition-colors py-3 border-b border-grey-600"
					class:text-pii-cyan={$page.url.pathname === '/'}
					on:click={close}
				>
					Akce
				</a>
				<a
					href="/archiv"
					class="text-white font-sans uppercase text-base tracking-wide hover:text-pii-cyan transition-colors py-3 border-b border-grey-600"
					class:text-pii-cyan={$page.url.pathname === '/archiv'}
					on:click={close}
				>
					Archiv
				</a>
				<a
					href="https://www.institutpi.cz"
					target="_blank"
					rel="noopener noreferrer"
					class="text-white font-sans uppercase text-base tracking-wide hover:text-pii-cyan transition-colors py-3"
					on:click={close}
				>
					O nás
				</a>
			</div>
		</div>
	</nav>
{/if}

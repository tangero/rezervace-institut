<script lang="ts">
	import { page } from '$app/stores';
	import MobileNav from './MobileNav.svelte';

	let mobileMenuOpen = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<header class="sticky top-0 bg-grey-800 py-4 md:py-6 shadow-lg z-50">
	<div class="container mx-auto px-4">
		<div class="flex items-center justify-between">
			<!-- Logo and Title -->
			<a href="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
				<div class="h-8 w-8 md:h-10 md:w-10 bg-pii-cyan rounded-full flex items-center justify-center">
					<span class="text-white font-bebas text-xl md:text-2xl">π</span>
				</div>
				<span class="font-bebas text-white text-2xl md:text-3xl uppercase tracking-wide">
					Akce
				</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden md:flex gap-6 items-center">
				<a
					href="/"
					class="text-white font-sans uppercase text-sm tracking-wide hover:text-pii-cyan transition-colors"
					class:text-pii-cyan={$page.url.pathname === '/'}
				>
					Akce
				</a>
				<a
					href="/archiv"
					class="text-white font-sans uppercase text-sm tracking-wide hover:text-pii-cyan transition-colors"
					class:text-pii-cyan={$page.url.pathname === '/archiv'}
				>
					Archiv
				</a>
				<a
					href="https://www.institutpi.cz"
					target="_blank"
					rel="noopener noreferrer"
					class="text-white font-sans uppercase text-sm tracking-wide hover:text-pii-cyan transition-colors"
				>
					O nás
				</a>
			</nav>

			<!-- Mobile Menu Button -->
			<button
				class="md:hidden text-white p-2 hover:text-pii-cyan transition-colors"
				on:click={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<!-- Close Icon -->
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				{:else}
					<!-- Hamburger Icon -->
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</header>

<!-- Mobile Navigation -->
<MobileNav isOpen={mobileMenuOpen} on:close={() => (mobileMenuOpen = false)} />

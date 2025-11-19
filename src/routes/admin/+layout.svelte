<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: 'home' },
		{ href: '/admin/akce', label: 'Akce', icon: 'calendar' },
		{ href: '/admin/nastaveni', label: 'Nastavení', icon: 'settings' }
	];

	let mobileMenuOpen = false;
	let userEmail = '';

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function handleLogout() {
		if (browser) {
			localStorage.removeItem('admin_token');
			localStorage.removeItem('admin_user');
		}
		goto('/admin/login');
	}

	// Check authentication on mount
	onMount(() => {
		// Allow access to login page
		if ($page.url.pathname === '/admin/login') {
			return;
		}

		// Check if user is authenticated
		if (browser) {
			const token = localStorage.getItem('admin_token');
			const user = localStorage.getItem('admin_user');

			if (!token) {
				// Not authenticated, redirect to login
				goto('/admin/login');
			} else if (user) {
				try {
					const userData = JSON.parse(user);
					userEmail = userData.email;
				} catch (e) {
					console.error('Failed to parse user data');
				}
			}
		}
	});
</script>

<svelte:head>
	<title>Admin - Institut Pí</title>
</svelte:head>

<div class="min-h-screen bg-grey-50">
	<!-- Admin Header -->
	<header class="bg-grey-800 text-white shadow-lg">
		<div class="container mx-auto px-4 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
						<div
							class="h-8 w-8 bg-pii-cyan rounded-full flex items-center justify-center text-white font-bebas text-xl"
						>
							π
						</div>
						<span class="font-bebas text-xl uppercase">Admin</span>
					</a>
				</div>

				<!-- Desktop Nav -->
				<nav class="hidden md:flex items-center gap-6">
					{#each navItems as item}
						<a
							href={item.href}
							class="font-sans text-sm uppercase tracking-wide hover:text-pii-cyan transition-colors"
							class:text-pii-cyan={$page.url.pathname === item.href}
						>
							{item.label}
						</a>
					{/each}

					{#if userEmail}
						<span class="text-grey-400 text-sm font-sans">{userEmail}</span>
					{/if}
					<button on:click={handleLogout} class="btn-outline text-xs py-2 px-4">
						Odhlásit se
					</button>
				</nav>

				<!-- Mobile Menu Button -->
				<button class="md:hidden text-white" on:click={toggleMobileMenu}>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</div>
	</header>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden bg-grey-800 border-t border-grey-600">
			<nav class="container mx-auto px-4 py-4 space-y-2">
				{#each navItems as item}
					<a
						href={item.href}
						class="block py-2 text-white font-sans uppercase text-sm hover:text-pii-cyan transition-colors"
						class:text-pii-cyan={$page.url.pathname === item.href}
						on:click={toggleMobileMenu}
					>
						{item.label}
					</a>
				{/each}
				<a
					href="/"
					class="block py-2 text-white font-sans uppercase text-sm hover:text-pii-cyan transition-colors"
					on:click={toggleMobileMenu}
				>
					Zpět na web
				</a>
			</nav>
		</div>
	{/if}

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/admin/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Přihlášení se nezdařilo';
				loading = false;
				return;
			}

			// Store token in localStorage
			if (browser) {
				localStorage.setItem('admin_token', data.token);
				localStorage.setItem('admin_user', JSON.stringify(data.user));
			}

			// Redirect to admin dashboard
			goto('/admin');
		} catch (err) {
			console.error('Login error:', err);
			error = 'Nepodařilo se připojit k serveru';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Přihlášení - Admin</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-grey-100 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full">
		<!-- Logo/Header -->
		<div class="text-center mb-8">
			<h1 class="font-bebas text-5xl uppercase text-grey-800 mb-2">Institut Pí</h1>
			<p class="text-grey-600 font-sans">Admin Panel</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white rounded-lg shadow-lg p-8">
			<h2 class="font-bebas text-3xl uppercase mb-6 text-center">Přihlášení</h2>

			{#if error}
				<div class="bg-error/10 border border-error text-error p-4 rounded mb-6">
					<p class="font-sans text-sm">{error}</p>
				</div>
			{/if}

			<form on:submit={handleLogin} class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-sans font-bold mb-2 text-grey-700">
						Email
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						placeholder="admin@institutpi.cz"
						class="w-full px-4 py-3 border border-grey-300 rounded-lg focus:outline-none focus:border-pii-cyan font-sans"
						disabled={loading}
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-sans font-bold mb-2 text-grey-700">
						Heslo
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="w-full px-4 py-3 border border-grey-300 rounded-lg focus:outline-none focus:border-pii-cyan font-sans"
						disabled={loading}
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full btn-primary {loading ? 'opacity-50 cursor-not-allowed' : ''}"
				>
					{#if loading}
						Přihlašování...
					{:else}
						Přihlásit se
					{/if}
				</button>
			</form>

			<!-- Development Info -->
			<div class="mt-6 p-4 bg-info/10 border border-info rounded">
				<p class="font-sans text-xs text-info font-bold mb-1">🔓 Vývojový režim</p>
				<p class="font-sans text-xs text-grey-600 mb-1">
					Email: <code class="bg-grey-200 px-1 rounded">admin@institutpi.cz</code>
				</p>
				<p class="font-sans text-xs text-grey-600">
					Heslo: <code class="bg-grey-200 px-1 rounded">admin123</code>
				</p>
			</div>
		</div>

		<!-- Back Link -->
		<div class="text-center mt-6">
			<a href="/" class="text-pii-cyan hover:underline font-sans text-sm">
				← Zpět na hlavní stránku
			</a>
		</div>
	</div>
</div>

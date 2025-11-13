<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { authenticatedFetch } from '$lib/client/api';

	export let data: PageData;

	let loading = true;
	let error = '';
	let event: any = null;
	let registrations: any[] = [];
	let counts = { total: 0, confirmed: 0, pending: 0 };
	let includeUnconfirmed = true;

	onMount(async () => {
		await loadRegistrations();
	});

	async function loadRegistrations() {
		loading = true;
		error = '';

		try {
			const url = `/api/admin/events/${data.eventSlug}/registrations?include_unconfirmed=${includeUnconfirmed}`;
			const response = await authenticatedFetch(url);

			if (!response.ok) {
				error = 'Nepodařilo se načíst registrace';
				loading = false;
				return;
			}

			const result = await response.json();
			event = result.event;
			registrations = result.registrations || [];
			counts = result.counts || { total: 0, confirmed: 0, pending: 0 };
		} catch (err) {
			console.error('Error loading registrations:', err);
			error = 'Chyba při načítání registrací';
		} finally {
			loading = false;
		}
	}

	async function handleFilterChange() {
		await loadRegistrations();
	}

	function formatDate(dateString: string) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleString('cs-CZ');
	}

	function getStatusBadge(registration: any) {
		if (!registration.is_confirmed) {
			return { color: 'bg-warning text-white', label: 'Čeká na potvrzení' };
		}
		if (registration.payment_status === 'paid') {
			return { color: 'bg-success text-white', label: 'Zaplaceno' };
		}
		return { color: 'bg-info text-white', label: 'Potvrzeno' };
	}

	async function exportToCSV() {
		const csvRows = [
			['Email', 'Stav', 'Platba', 'Registrace', 'Potvrzení', 'Zaplaceno'].join(';')
		];

		registrations.forEach((reg) => {
			csvRows.push(
				[
					reg.email,
					reg.is_confirmed ? 'Potvrzeno' : 'Čeká',
					reg.payment_status || '-',
					formatDate(reg.registered_at),
					formatDate(reg.confirmed_at),
					formatDate(reg.payment_confirmed_at)
				].join(';')
			);
		});

		const csvContent = csvRows.join('\n');
		const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `registrace-${event?.slug || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
	}
</script>

<svelte:head>
	<title>Registrace - {event?.title || 'Načítání...'} - Admin</title>
</svelte:head>

<div class="max-w-6xl">
	<!-- Page Header -->
	<div class="mb-8">
		<a
			href="/admin/akce"
			class="inline-flex items-center gap-2 text-pii-cyan hover:underline mb-4 font-sans"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			<span>Zpět na seznam akcí</span>
		</a>
		<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-2">
			Registrace: {event?.title || 'Načítání...'}
		</h1>
		<p class="text-grey-600 font-sans">Správa registrací na akci</p>
	</div>

	<!-- Loading State -->
	{#if loading && !event}
		<div class="bg-grey-100 border border-grey-300 p-8 rounded-lg text-center">
			<p class="font-sans">Načítání registrací...</p>
		</div>
	{:else if error && !event}
		<div class="bg-error/10 border border-error text-error p-6 rounded-lg">
			<p class="font-sans font-bold mb-2">⚠️ Chyba načítání</p>
			<p class="font-sans text-sm">{error}</p>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="grid md:grid-cols-3 gap-4 mb-6">
			<div class="bg-white rounded-lg shadow-md p-6">
				<p class="text-grey-600 font-sans text-sm mb-1">Celkem registrací</p>
				<p class="font-bebas text-4xl text-grey-800">{counts.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow-md p-6">
				<p class="text-grey-600 font-sans text-sm mb-1">Potvrzené</p>
				<p class="font-bebas text-4xl text-success">{counts.confirmed}</p>
			</div>
			<div class="bg-white rounded-lg shadow-md p-6">
				<p class="text-grey-600 font-sans text-sm mb-1">Čekající</p>
				<p class="font-bebas text-4xl text-warning">{counts.pending}</p>
			</div>
		</div>

		<!-- Filters and Actions -->
		<div class="bg-white rounded-lg shadow-md p-4 mb-6">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 font-sans text-sm">
						<input
							type="checkbox"
							bind:checked={includeUnconfirmed}
							on:change={handleFilterChange}
							class="w-4 h-4"
						/>
						<span>Zobrazit nepotvrzené</span>
					</label>
				</div>
				<button on:click={exportToCSV} class="btn-outline" disabled={registrations.length === 0}>
					📥 Exportovat CSV
				</button>
			</div>
		</div>

		<!-- Registrations Table -->
		<div class="bg-white rounded-lg shadow-md overflow-hidden">
			{#if registrations.length === 0}
				<div class="p-12 text-center">
					<div
						class="w-16 h-16 bg-grey-200 rounded-full flex items-center justify-center mx-auto mb-4"
					>
						<svg class="w-8 h-8 text-grey-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>
					<h3 class="font-bebas text-2xl uppercase mb-2">Žádné registrace</h3>
					<p class="text-grey-600 font-sans">
						{#if includeUnconfirmed}
							Na tuto akci se zatím nikdo neregistroval.
						{:else}
							Žádné potvrzené registrace. Zkuste zobrazit i nepotvrzené.
						{/if}
					</p>
				</div>
			{:else}
				<!-- Desktop Table -->
				<div class="hidden md:block overflow-x-auto">
					<table class="w-full">
						<thead class="bg-grey-100 border-b border-grey-200">
							<tr>
								<th
									class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600"
								>
									Email
								</th>
								<th
									class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600"
								>
									Status
								</th>
								<th
									class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600"
								>
									Registrace
								</th>
								<th
									class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600"
								>
									Potvrzení
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-grey-200">
							{#each registrations as registration}
								{@const badge = getStatusBadge(registration)}
								<tr class="hover:bg-grey-50 transition-colors">
									<td class="px-6 py-4 font-sans text-sm">{registration.email}</td>
									<td class="px-6 py-4">
										<span class="px-3 py-1 rounded-full text-xs font-sans font-bold {badge.color}">
											{badge.label}
										</span>
									</td>
									<td class="px-6 py-4 font-sans text-sm text-grey-600">
										{formatDate(registration.registered_at)}
									</td>
									<td class="px-6 py-4 font-sans text-sm text-grey-600">
										{formatDate(registration.confirmed_at)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Cards -->
				<div class="md:hidden divide-y divide-grey-200">
					{#each registrations as registration}
						{@const badge = getStatusBadge(registration)}
						<div class="p-4">
							<div class="flex items-start justify-between mb-2">
								<p class="font-sans font-bold text-sm">{registration.email}</p>
								<span class="px-2 py-1 rounded-full text-xs font-sans font-bold {badge.color}">
									{badge.label}
								</span>
							</div>
							<div class="space-y-1">
								<p class="font-sans text-xs text-grey-600">
									Registrace: {formatDate(registration.registered_at)}
								</p>
								{#if registration.confirmed_at}
									<p class="font-sans text-xs text-grey-600">
										Potvrzení: {formatDate(registration.confirmed_at)}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

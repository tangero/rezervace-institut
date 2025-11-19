<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_ADMIN_TOKEN } from '$env/static/public';
	import type { Event } from '../../../workers/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let events: Partial<Event>[] = [];
	let isLoading = true;
	let eventsError: string | null = null;

	const ADMIN_TOKEN = PUBLIC_ADMIN_TOKEN;

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/events', {
				headers: {
					Authorization: `Bearer ${ADMIN_TOKEN}`
				}
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || `Failed to fetch events: ${res.statusText}`);
			}

			const eventData = await res.json();
			events = eventData.data;
		} catch (e: any) {
			eventsError = e.message;
		} finally {
			isLoading = false;
		}
	});

	async function deleteEvent(eventId: string) {
		if (!confirm('Opravdu chcete smazat tuto akci? Tato akce je nevratná.')) {
			return;
		}

		try {
			const res = await fetch(`/api/admin/events/${eventId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${ADMIN_TOKEN}`
				}
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || `Failed to delete event: ${res.statusText}`);
			}

			// Remove event from the list
			events = events.filter((e) => e.id !== eventId);
			alert('Akce byla úspěšně smazána.');
		} catch (e: any) {
			eventsError = e.message;
			alert(`Chyba při mazání akce: ${eventsError}`);
		}
	}
</script>

<svelte:head>
	<title>Administrace</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-8">
	
	<!-- Dashboard Stats -->
	<section class="mb-8">
		<h2 class="text-2xl font-bold mb-4">Dashboard</h2>
		{#if data.error}
			<div class="alert alert-warning">
				<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
				<span><strong>Chyba načítání dat:</strong> {data.error}. Zkontrolujte konfiguraci D1 databáze a funkčnost API.</span>
			</div>
		{:else if data.stats}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div class="stat bg-base-200 rounded-box">
					<div class="stat-title">Nadcházející akce</div>
					<div class="stat-value">{data.stats.upcoming_events}</div>
				</div>
				<div class="stat bg-base-200 rounded-box">
					<div class="stat-title">Aktivní registrace</div>
					<div class="stat-value">{data.stats.active_registrations}</div>
				</div>
				<div class="stat bg-base-200 rounded-box">
					<div class="stat-title">Čeká na potvrzení</div>
					<div class="stat-value">{data.stats.pending_confirmations}</div>
				</div>
				<div class="stat bg-base-200 rounded-box">
					<div class="stat-title">Celkové tržby</div>
					<div class="stat-value">{new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(data.stats.total_revenue)}</div>
				</div>
			</div>
		{/if}
	</section>

	<div class="divider"></div>

	<!-- Event Management -->
	<section>
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-2xl font-bold">Správa akcí</h2>
			<a href="/admin/new" class="btn btn-primary">Nová akce</a>
		</div>

		{#if isLoading}
			<p>Načítání akcí...</p>
		{:else if eventsError}
			<div class="alert alert-error">
				<p>Chyba při načítání akcí:</p>
				<pre>{eventsError}</pre>
			</div>
		{:else if events.length === 0}
			<p>Nebyly nalezeny žádné akce. <a href="/admin/new" class="link">Vytvořte první</a>.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="table w-full">
					<thead>
						<tr>
							<th>Název</th>
							<th>Datum</th>
							<th>Status</th>
							<th>Registrace</th>
							<th>Akce</th>
						</tr>
					</thead>
					<tbody>
						{#each events as event}
							<tr>
								<td>
									<a href={`/admin/edit/${event.id}`} class="font-bold link link-hover">{event.title}</a>
								</td>
								<td>
									{#if event.event_date}
										{new Date(event.event_date).toLocaleDateString('cs-CZ')}
									{:else}
										N/A
									{/if}
								</td>
								<td>
									<span
										class="badge"
										class:badge-success={event.status === 'published'}
										class:badge-warning={event.status === 'draft'}
										class:badge-error={event.status === 'cancelled'}
									>
										{event.status}
									</span>
								</td>
								<td>
									{event.current_registrations} / {event.max_capacity ?? '∞'}
								</td>
								<td class="space-x-2">
									<a href={`/admin/edit/${event.id}`} class="btn btn-sm btn-outline">Upravit</a>
									<button on:click={() => deleteEvent(event.id)} class="btn btn-sm btn-error btn-outline">
										Smazat
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>

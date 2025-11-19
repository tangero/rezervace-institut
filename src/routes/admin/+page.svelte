<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from '../../../workers/types';

	let events: Partial<Event>[] = [];
	let isLoading = true;
	let error: string | null = null;

	// IMPORTANT: This is for development only. In a real app, this should be handled
	// by a secure authentication flow (e.g., login page) and the token stored
	// in a secure way (e.g., HttpOnly cookie).
	const ADMIN_TOKEN = 'super-secret-dev-token';

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

			const data = await res.json();
			events = data.data;
		} catch (e: any) {
			error = e.message;
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
			error = e.message;
			alert(`Chyba při mazání akce: ${error}`);
		}
	}
</script>

<svelte:head>
	<title>Administrace akcí</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Správa akcí</h1>
		<a href="/admin/new" class="btn btn-primary">Nová akce</a>
	</div>

	{#if isLoading}
		<p>Načítání akcí...</p>
	{:else if error}
		<div class="alert alert-error">
			<p>Chyba při načítání akcí:</p>
			<pre>{error}</pre>
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
							<td>{new Date(event.event_date!).toLocaleDateString('cs-CZ')}</td>
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
								<button on:click={() => deleteEvent(event.id!)} class="btn btn-sm btn-error btn-outline">
									Smazat
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

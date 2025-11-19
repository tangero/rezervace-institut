<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_ADMIN_TOKEN } from '$env/static/public';
	import type { Event } from '../../../../workers/types';

	let event: Partial<Event> = {
		title: '',
		short_description: '',
		long_description: '',
		program: '',
		venue_name: 'Institut Pí',
		venue_address: 'náměstí Míru 820/9, 120 00 Praha 2-Vinohrady',
		event_date: new Date().toISOString().split('T')[0],
		start_time: '18:00',
		duration_minutes: 90,
		max_capacity: 50,
		status: 'draft',
		is_paid: false,
		price_czk: 0
	};

	let isLoading = false;
	let error: string | null = null;
	const ADMIN_TOKEN = PUBLIC_ADMIN_TOKEN;

	async function handleSubmit() {
		isLoading = true;
		error = null;

		try {
			const res = await fetch('/api/admin/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${ADMIN_TOKEN}`
				},
				body: JSON.stringify(event)
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Nepodařilo se vytvořit akci.');
			}

			alert('Akce byla úspěšně vytvořena!');
			await goto('/admin');
		} catch (e: any) {
			error = e.message;
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Nová akce</title>
</svelte:head>

<div class="container mx-auto p-4 md:p-8">
	<h1 class="text-3xl font-bold mb-6">Nová akce</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="form-control">
				<label for="title" class="label">Název akce</label>
				<input type="text" id="title" bind:value={event.title} class="input input-bordered" required />
			</div>

			<div class="form-control">
				<label for="status" class="label">Status</label>
				<select id="status" bind:value={event.status} class="select select-bordered">
					<option value="draft">Koncept (Draft)</option>
					<option value="published">Publikováno (Published)</option>
					<option value="cancelled">Zrušeno (Cancelled)</option>
				</select>
			</div>
		</div>

		<div class="form-control">
			<label for="short_description" class="label">Krátký popis (max 250 znaků)</label>
			<textarea id="short_description" bind:value={event.short_description} class="textarea textarea-bordered" maxlength="250"></textarea>
		</div>

		<div class="form-control">
			<label for="long_description" class="label">Dlouhý popis (Markdown podporován)</label>
			<textarea id="long_description" bind:value={event.long_description} class="textarea textarea-bordered h-32"></textarea>
		</div>

		<div class="divider">Detaily konání</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="form-control">
				<label for="event_date" class="label">Datum</label>
				<input type="date" id="event_date" bind:value={event.event_date} class="input input-bordered" required />
			</div>
			<div class="form-control">
				<label for="start_time" class="label">Čas začátku</label>
				<input type="time" id="start_time" bind:value={event.start_time} class="input input-bordered" required />
			</div>
			<div class="form-control">
				<label for="duration_minutes" class="label">Délka (v minutách)</label>
				<input type="number" id="duration_minutes" bind:value={event.duration_minutes} class="input input-bordered" required />
			</div>
			<div class="form-control">
				<label for="max_capacity" class="label">Kapacita</label>
				<input type="number" id="max_capacity" bind:value={event.max_capacity} class="input input-bordered" />
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="form-control">
				<label for="venue_name" class="label">Název místa</label>
				<input type="text" id="venue_name" bind:value={event.venue_name} class="input input-bordered" />
			</div>
			<div class="form-control">
				<label for="venue_address" class="label">Adresa místa</label>
				<input type="text" id="venue_address" bind:value={event.venue_address} class="input input-bordered" required />
			</div>
		</div>

		<div class="divider">Vstupné</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Je akce placená?</span>
					<input type="checkbox" bind:checked={event.is_paid} class="toggle toggle-primary" />
				</label>
			</div>
			{#if event.is_paid}
				<div class="form-control">
					<label for="price_czk" class="label">Cena (CZK)</label>
					<input type="number" id="price_czk" bind:value={event.price_czk} class="input input-bordered" />
				</div>
			{/if}
		</div>


		{#if error}
			<div class="alert alert-error">
				<p>{error}</p>
			</div>
		{/if}

		<div class="flex justify-end gap-4 mt-8">
			<a href="/admin" class="btn btn-ghost">Zrušit</a>
			<button type="submit" class="btn btn-primary" disabled={isLoading}>
				{#if isLoading}Ukládání...{:else}Vytvořit akci{/if}
			</button>
		</div>
	</form>
</div>

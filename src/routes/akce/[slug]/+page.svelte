<script lang="ts">
	import type { PageData } from './$types';
	import { isValidEmail } from '../../../utils';

	export let data: PageData;

	let userEmail = '';
	let isLoading = false;
	let formMessage: { type: 'success' | 'error'; text: string } | null = null;
	let isRegistered = false;

	async function handleRegistration() {
		formMessage = null;
		if (!isValidEmail(userEmail)) {
			formMessage = { type: 'error', text: 'Zadejte prosím platnou e-mailovou adresu.' };
			return;
		}

		isLoading = true;
		try {
			const res = await fetch(`/api/events/${data.event.id}/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: userEmail })
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.error || 'Neznámá chyba při registraci.');
			}

			formMessage = { type: 'success', text: result.message || 'Registrace proběhla úspěšně! Zkontrolujte prosím svůj e-mail pro potvrzení.' };
			isRegistered = true;
		} catch (e: any) {
			formMessage = { type: 'error', text: e.message };
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />

	{@const event = data.event}
	{#if event}
		{@const startDateTime = new Date(`${event.event_date}T${event.start_time}`)}
		{@const endDateTime = new Date(startDateTime.getTime() + event.duration_minutes * 60000)}

		<script type="application/ld+json">
			{JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'Event',
				name: event.title,
				description: event.short_description,
				startDate: startDateTime.toISOString(),
				endDate: endDateTime.toISOString(),
				eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
				eventStatus:
					event.status === 'cancelled'
						? 'https://schema.org/EventCancelled'
						: 'https://schema.org/EventScheduled',
				location: {
					'@type': 'Place',
					name: event.venue_name,
					address: {
						'@type': 'PostalAddress',
						streetAddress: event.venue_address.split(',')[0],
						addressLocality: 'Praha',
						postalCode: event.venue_address.split(',')[1]?.trim().split(' ')[0],
						addressCountry: 'CZ'
					}
				},
				image: [event.image_url || 'https://akce.institutpi.cz/default-og-image.jpg'],
				offers: {
					'@type': 'Offer',
					url: `https://akce.institutpi.cz/akce/${event.slug}`,
					price: event.is_paid ? event.price_czk : '0',
					priceCurrency: 'CZK',
					availability:
						event.available_spots !== null && event.available_spots <= 0
							? 'https://schema.org/SoldOut'
							: 'https://schema.org/InStock',
					validFrom: event.created_at
				},
				performer: event.guest_names
					? {
							'@type': 'Person',
							name: JSON.parse(event.guest_names).join(', ')
					  }
					: undefined
			})}
		</script>
	{/if}
</svelte:head>

<div class="container mx-auto p-4 md:p-8">
	{#if data.event}
		<article class="prose lg:prose-xl max-w-4xl mx-auto">
			<h1>{data.event.title}</h1>
			<p class="lead">{data.event.short_description}</p>

			<div class="not-prose grid grid-cols-2 gap-4 my-8 text-center">
				<div class="stat">
					<div class="stat-title">Datum</div>
					<div class="stat-value text-xl">{new Date(data.event.event_date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
				</div>
				<div class="stat">
					<div class="stat-title">Čas</div>
					<div class="stat-value text-xl">{data.event.start_time}</div>
				</div>
				<div class="stat">
					<div class="stat-title">Místo</div>
					<div class="stat-value text-xl">{data.event.venue_name}</div>
				</div>
				<div class="stat">
					<div class="stat-title">Vstup</div>
					<div class="stat-value text-xl">{data.event.is_paid ? `${data.event.price_czk} Kč` : 'Zdarma'}</div>
				</div>
			</div>
			
			{@html data.event.long_description}

			{#if data.event.program}
				<h2>Program</h2>
				{@html data.event.program}
			{/if}

			{#if data.event.guest_names}
				<h2>Hosté</h2>
				<!-- Assuming guest_names is a JSON string array -->
				<ul>
					{#each JSON.parse(data.event.guest_names) as guest}
						<li>{guest}</li>
					{/each}
				</ul>
			{/if}

			<div class="divider my-12"></div>

			<div id="registrace" class="not-prose card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-2xl">Registrace na akci</h2>
					
					{#if data.event.available_spots !== null && data.event.available_spots <= 0}
						<div class="alert alert-warning">
							<p>Kapacita akce je bohužel naplněna. Registrace není možná.</p>
						</div>
					{:else if isRegistered}
						<div class="alert alert-success">
							<p>{formMessage?.text}</p>
						</div>
					{:else}
						<p>
							Zbývá volných míst: 
							<span class="font-bold">{data.event.available_spots ?? 'neomezeno'}</span>. 
							Zaregistrujte se včas.
						</p>
						<form on:submit|preventDefault={handleRegistration} class="form-control mt-4">
							<div class="join">
								<input 
									type="email" 
									placeholder="vas@email.cz" 
									class="input input-bordered join-item w-full" 
									bind:value={userEmail}
									required
								/>
								<button class="btn btn-primary join-item" type="submit" disabled={isLoading}>
									{#if isLoading}Registruji...{:else}Registrovat{/if}
								</button>
							</div>
						</form>
						{#if formMessage}
							<div class={`alert mt-4 ${formMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
								<p>{formMessage.text}</p>
							</div>
						{/if}
					{/if}
				</div>
			</div>

		</article>
	{:else}
		<div class="text-center">
			<h1 class="text-2xl font-bold">Chyba</h1>
			<p>{data.error?.message || 'Akce nebyla nalezena.'}</p>
			<a href="/" class="btn btn-primary mt-4">Zpět na hlavní stránku</a>
		</div>
	{/if}
</div>

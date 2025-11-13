<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, formatTime, calculateEndTime } from '$lib/utils';

	export let data: PageData;
	const { event } = data;

	let showRegistrationForm = false;
	let email = '';
	let registering = false;
	let registrationMessage = '';
	let registrationSuccess = false;

	function toggleRegistrationForm() {
		showRegistrationForm = !showRegistrationForm;
	}

	async function handleRegistration(e: Event) {
		e.preventDefault();
		registering = true;
		registrationMessage = '';
		registrationSuccess = false;

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					eventId: event.id
				})
			});

			const data = await response.json();

			if (response.ok && data.success) {
				registrationSuccess = true;
				registrationMessage = data.message;
				email = '';
			} else {
				registrationMessage = data.error || 'Registrace se nezdařila. Zkuste to prosím znovu.';
			}
		} catch (err) {
			console.error('Registration error:', err);
			registrationMessage =
				'Nastala chyba při registraci. Zkontrolujte připojení k internetu a zkuste to znovu.';
		} finally {
			registering = false;
		}
	}

	function addToCalendar() {
		// Will implement .ics download
		alert('Funkce přidání do kalendáře bude brzy dostupná');
	}
</script>

<svelte:head>
	<title>{event.title} - Institut Pí</title>
	<meta name="description" content={event.short_description} />
</svelte:head>

<!-- Hero Image -->
{#if event.image_url}
	<div class="w-full h-64 md:h-96 overflow-hidden bg-grey-800">
		<img
			src={event.image_url}
			alt={event.image_alt || event.title}
			class="w-full h-full object-cover"
		/>
	</div>
{/if}

<!-- Main Content -->
<article class="py-8 md:py-12">
	<div class="container mx-auto px-4 max-w-4xl">
		<!-- Back Button -->
		<a
			href="/"
			class="inline-flex items-center gap-2 text-pii-cyan hover:underline mb-6 font-sans"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			<span>Zpět na přehled akcí</span>
		</a>

		<!-- Event Meta -->
		<div class="flex flex-wrap gap-4 mb-6 text-sm text-grey-600">
			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 text-pii-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<span class="font-sans">{formatDate(event.event_date)}</span>
			</div>

			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 text-pii-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="font-sans"
					>{event.start_time} - {calculateEndTime(
						event.start_time,
						event.duration_minutes
					)}</span
				>
			</div>

			<div class="flex items-center gap-2">
				<svg class="w-5 h-5 text-pii-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
					/>
				</svg>
				<span class="font-sans">{event.venue_name}</span>
			</div>
		</div>

		<!-- Title -->
		<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-4">{event.title}</h1>

		<!-- Short Description -->
		<p class="text-xl text-grey-600 mb-8 leading-7">{event.short_description}</p>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-4 mb-12">
			{#if event.available_spots !== null && event.available_spots > 0}
				<button on:click={toggleRegistrationForm} class="btn-primary">
					Registrovat se
					{#if event.available_spots < 10}
						<span class="ml-2 text-sm">(zbývá {event.available_spots})</span>
					{/if}
				</button>
			{:else if event.available_spots === 0}
				<button disabled class="btn-primary opacity-50 cursor-not-allowed">
					Akce je plně obsazena
				</button>
			{:else}
				<button on:click={toggleRegistrationForm} class="btn-primary"> Registrovat se </button>
			{/if}

			<button on:click={addToCalendar} class="btn-outline"> Přidat do kalendáře </button>
		</div>

		<!-- Registration Form -->
		{#if showRegistrationForm}
			<div class="bg-grey-50 rounded-lg p-6 md:p-8 mb-12 border-2 border-pii-cyan">
				<h2 class="font-bebas text-2xl uppercase mb-4">Registrace na akci</h2>

				{#if registrationSuccess}
					<div class="bg-success/10 border border-success text-success p-4 rounded mb-4">
						<p class="font-sans">{registrationMessage}</p>
					</div>
				{:else}
					<form on:submit={handleRegistration} class="space-y-4">
						<div>
							<label for="email" class="block text-sm font-sans font-bold mb-2">
								Email *
							</label>
							<input
								type="email"
								id="email"
								bind:value={email}
								required
								placeholder="vas@email.cz"
								class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
							/>
						</div>

						{#if event.is_paid}
							<div class="bg-info/10 border border-info p-4 rounded">
								<p class="font-sans text-sm mb-2">
									<strong>Poplatek:</strong>
									{event.price_czk} Kč
								</p>
								<p class="font-sans text-sm text-grey-600">
									Po registraci obdržíte email s platebními údaji a QR kódem.
								</p>
							</div>
						{/if}

						<div class="flex items-start gap-2">
							<input type="checkbox" id="gdpr" required class="mt-1" />
							<label for="gdpr" class="text-sm font-sans text-grey-600">
								Souhlasím se zpracováním osobních údajů pro účely této registrace v souladu s
								<a href="https://www.institutpi.cz" class="text-pii-cyan hover:underline"
									>GDPR</a
								>.
							</label>
						</div>

						{#if registrationMessage && !registrationSuccess}
							<div class="bg-error/10 border border-error text-error p-4 rounded">
								<p class="font-sans text-sm">{registrationMessage}</p>
							</div>
						{/if}

						<div class="flex gap-4">
							<button
								type="submit"
								disabled={registering}
								class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{registering ? 'Odesílám...' : 'Potvrdit registraci'}
							</button>
							<button type="button" on:click={toggleRegistrationForm} class="btn-outline">
								Zrušit
							</button>
						</div>
					</form>
				{/if}
			</div>
		{/if}

		<!-- Event Details Grid -->
		<div class="grid md:grid-cols-3 gap-8 mb-12">
			<!-- Location -->
			<div>
				<h3 class="font-bebas text-xl uppercase mb-3 flex items-center gap-2">
					<svg class="w-5 h-5 text-pii-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
					</svg>
					Místo
				</h3>
				<p class="font-sans text-grey-600">
					<strong>{event.venue_name}</strong><br />
					{event.venue_address}
				</p>
			</div>

			<!-- Date & Time -->
			<div>
				<h3 class="font-bebas text-xl uppercase mb-3 flex items-center gap-2">
					<svg class="w-5 h-5 text-pii-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					Datum a čas
				</h3>
				<p class="font-sans text-grey-600">
					{formatDate(event.event_date)}<br />
					{event.start_time} - {calculateEndTime(event.start_time, event.duration_minutes)}<br />
					<span class="text-sm">({event.duration_minutes} minut)</span>
				</p>
			</div>

			<!-- Capacity -->
			{#if event.max_capacity}
				<div>
					<h3 class="font-bebas text-xl uppercase mb-3 flex items-center gap-2">
						<svg
							class="w-5 h-5 text-pii-cyan"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						Kapacita
					</h3>
					<p class="font-sans text-grey-600">
						<strong>{event.current_registrations} / {event.max_capacity}</strong> registrovaných
						{#if event.available_spots !== null}
							<br />
							<span class="text-sm"
								>Zbývá {event.available_spots}
								{event.available_spots === 1
									? 'místo'
									: event.available_spots < 5
										? 'místa'
										: 'míst'}</span
							>
						{/if}
					</p>
				</div>
			{/if}
		</div>

		<!-- Long Description -->
		{#if event.long_description}
			<section class="mb-12">
				<h2 class="font-bebas text-3xl uppercase mb-4">O akci</h2>
				<div class="prose prose-lg max-w-none font-serif">
					{@html event.long_description}
				</div>
			</section>
		{/if}

		<!-- Program -->
		{#if event.program}
			<section class="mb-12">
				<h2 class="font-bebas text-3xl uppercase mb-4">Program</h2>
				<div class="prose prose-lg max-w-none font-serif">
					{@html event.program}
				</div>
			</section>
		{/if}

		<!-- Guests -->
		{#if event.guest_names && event.guest_names.length > 0}
			<section class="mb-12">
				<h2 class="font-bebas text-3xl uppercase mb-4">Hosté</h2>
				<div class="flex flex-wrap gap-3">
					{#each event.guest_names as guest}
						<span
							class="bg-pii-cyan/10 text-pii-cyan px-4 py-2 rounded-full font-sans text-sm font-bold"
						>
							{guest}
						</span>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</article>

<!-- Fixed Bottom CTA (Mobile) -->
{#if !showRegistrationForm}
	<div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grey-200 p-4 z-40">
		{#if event.available_spots !== null && event.available_spots > 0}
			<button on:click={toggleRegistrationForm} class="btn-primary w-full">
				Registrovat se
			</button>
		{:else if event.available_spots === 0}
			<button disabled class="btn-primary w-full opacity-50 cursor-not-allowed">
				Akce je plně obsazena
			</button>
		{:else}
			<button on:click={toggleRegistrationForm} class="btn-primary w-full">
				Registrovat se
			</button>
		{/if}
	</div>

	<!-- Spacer for fixed button -->
	<div class="md:hidden h-20"></div>
{/if}

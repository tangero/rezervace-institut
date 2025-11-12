<script lang="ts">
	import EventCard from '$components/EventCard.svelte';

	// Dummy data - will be replaced with actual API call
	const events = [
		{
			slug: 'debata-o-budoucnosti-eu',
			title: 'Debata o budoucnosti Evropské unie',
			short_description:
				'Připojte se k nám na diskusi o klíčových výzvách, kterým EU čelí v následujících letech. S hosty z akademické sféry a politiky.',
			event_date: '2025-12-15',
			start_time: '18:00',
			venue_name: 'Pirátské centrum Praha',
			venue_address: 'Na Moráni 360/3, Praha 2',
			image_url: 'https://placehold.co/800x450/2782AF/FFFFFF?text=EU+Debata',
			image_alt: 'Debata o EU',
			max_capacity: 50,
			current_registrations: 35
		},
		{
			slug: 'workshop-digitalizace',
			title: 'Workshop: Digitalizace veřejné správy',
			short_description:
				'Praktický workshop zaměřený na možnosti digitalizace veřejné správy. Sdílení best practices a diskuse o překážkách.',
			event_date: '2025-12-20',
			start_time: '14:00',
			venue_name: 'Impact Hub Praha',
			venue_address: 'Drtinova 10, Praha 5',
			image_url: 'https://placehold.co/800x450/2782AF/FFFFFF?text=Digitalizace',
			image_alt: 'Workshop digitalizace',
			max_capacity: 30,
			current_registrations: 8
		},
		{
			slug: 'klimaticka-politika-cr',
			title: 'Klimatická politika ČR v roce 2026',
			short_description:
				'Jaké jsou výzvy a příležitosti české klimatické politiky? Diskutujeme s experty o realistických cestách k uhlíkové neutralitě.',
			event_date: '2026-01-10',
			start_time: '19:00',
			venue_name: 'Kampus Hybernská',
			venue_address: 'Hybernská 4, Praha 1',
			image_url: 'https://placehold.co/800x450/2782AF/FFFFFF?text=Klima',
			image_alt: 'Klimatická politika',
			max_capacity: 80,
			current_registrations: 42
		}
	];
</script>

<svelte:head>
	<title>Institut Pí - Akce</title>
	<meta
		name="description"
		content="Přehled nadcházejících akcí politického think-tanku Institut Pí. Registrujte se na diskuse, workshopy a debaty."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-gradient-to-br from-grey-800 to-grey-600 text-white py-12 md:py-20">
	<div class="container mx-auto px-4 max-w-5xl">
		<h1 class="font-bebas text-4xl md:text-6xl uppercase mb-4">Nadcházející akce</h1>
		<p class="text-lg md:text-xl text-grey-100 max-w-2xl leading-7">
			Institut Pí pořádá debaty, workshopy a diskuse o důležitých společenských otázkách.
			Přidejte se k nám!
		</p>
	</div>
</section>

<!-- Events Grid -->
<section class="py-12 md:py-16">
	<div class="container mx-auto px-4 max-w-7xl">
		{#if events.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{#each events as event (event.slug)}
					<EventCard {event} />
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-12">
				<div class="w-20 h-20 bg-grey-200 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg class="w-10 h-10 text-grey-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h2 class="font-bebas text-3xl uppercase mb-2">Žádné nadcházející akce</h2>
				<p class="text-grey-600">Momentálně nemáme naplánované žádné akce. Vraťte se brzy!</p>
			</div>
		{/if}
	</div>
</section>

<!-- CTA Section -->
<section class="bg-pii-cyan text-white py-12 md:py-16">
	<div class="container mx-auto px-4 max-w-5xl text-center">
		<h2 class="font-bebas text-3xl md:text-4xl uppercase mb-4">Sledujte naše aktivity</h2>
		<p class="text-lg mb-6 max-w-2xl mx-auto">
			Chcete být informováni o nových akcích? Sledujte nás na sociálních sítích nebo navštivte náš
			hlavní web.
		</p>
		<a
			href="https://www.institutpi.cz"
			target="_blank"
			rel="noopener noreferrer"
			class="btn-secondary inline-block"
		>
			Navštívit institutpi.cz
		</a>
	</div>
</section>

<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';

	// Dummy data - will be replaced with actual API call
	const archiveEvents = [
		{
			slug: 'archiv-vzdelavani-21-stoleti',
			title: 'Vzdělávání v 21. století',
			short_description:
				'Již proběhlá akce o inovacích ve vzdělávání a přípravě mladých lidí na výzvy budoucnosti.',
			event_date: '2024-11-01',
			start_time: '16:00',
			venue_name: 'Pedagogická fakulta UK',
			venue_address: 'Školní 123, Praha 6',
			image_url: 'https://placehold.co/800x450/4B5563/FFFFFF?text=Vzd%C4%9Bl%C3%A1v%C3%A1n%C3%AD',
			image_alt: 'Vzdělávání v 21. století',
			max_capacity: 100,
			current_registrations: 85
		}
	];
</script>

<svelte:head>
	<title>Archiv akcí - Institut Pí</title>
	<meta
		name="description"
		content="Archiv proběhlých akcí politického think-tanku Institut Pí."
	/>
</svelte:head>

<!-- Hero Section -->
<section class="bg-grey-800 text-white py-12 md:py-16">
	<div class="container mx-auto px-4 max-w-5xl">
		<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-4">Archiv akcí</h1>
		<p class="text-lg text-grey-200 max-w-2xl leading-7">
			Přehled našich proběhlých akcí, diskusí a workshopů.
		</p>
	</div>
</section>

<!-- Archive Events Grid -->
<section class="py-12 md:py-16">
	<div class="container mx-auto px-4 max-w-7xl">
		{#if archiveEvents.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{#each archiveEvents as event (event.slug)}
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
							d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
						/>
					</svg>
				</div>
				<h2 class="font-bebas text-3xl uppercase mb-2">Žádné archivované akce</h2>
				<p class="text-grey-600">Zatím nemáme žádné proběhlé akce.</p>
			</div>
		{/if}
	</div>
</section>

<!-- CTA Section -->
<section class="bg-grey-100 py-12 md:py-16">
	<div class="container mx-auto px-4 max-w-5xl text-center">
		<h2 class="font-bebas text-3xl md:text-4xl uppercase mb-4">Podívejte se na nadcházející akce</h2>
		<p class="text-lg mb-6 max-w-2xl mx-auto text-grey-600">
			Nenechte si ujít naše další diskuse a workshopy o důležitých společenských otázkách.
		</p>
		<a href="/" class="btn-primary inline-block"> Nadcházející akce </a>
	</div>
</section>

<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Events are now loaded from the API via +page.server.ts
	$: events = data.events || [];
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

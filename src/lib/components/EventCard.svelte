<script lang="ts">
	export let event: {
		slug: string;
		title: string;
		short_description: string;
		event_date: string;
		start_time: string;
		venue_name?: string;
		venue_address: string;
		image_url?: string;
		image_alt?: string;
		max_capacity?: number;
		current_registrations: number;
	};

	// Format date to Czech locale
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('cs-CZ', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	// Calculate available spots
	$: availableSpots = event.max_capacity
		? event.max_capacity - event.current_registrations
		: null;
</script>

<article class="card group">
	<!-- Image -->
	{#if event.image_url}
		<div class="relative overflow-hidden aspect-[16/9]">
			<img
				src={event.image_url}
				alt={event.image_alt || event.title}
				class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				loading="lazy"
			/>
			{#if availableSpots !== null && availableSpots < 10}
				<div class="absolute top-2 right-2 bg-error text-white px-3 py-1 rounded text-xs font-bold">
					Zbývá {availableSpots} {availableSpots === 1 ? 'místo' : availableSpots < 5 ? 'místa' : 'míst'}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Content -->
	<div class="p-6">
		<!-- Date & Time -->
		<div class="flex items-center gap-2 text-pii-cyan text-sm font-bold uppercase tracking-wide mb-2">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			<span>{formatDate(event.event_date)} · {event.start_time}</span>
		</div>

		<!-- Title -->
		<h3 class="font-serif text-xl md:text-2xl font-bold mb-3 group-hover:text-pii-cyan transition-colors">
			{event.title}
		</h3>

		<!-- Location -->
		<div class="flex items-start gap-2 text-grey-600 text-sm mb-3">
			<svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
			<span>
				{#if event.venue_name}
					<strong>{event.venue_name}</strong><br />
				{/if}
				{event.venue_address}
			</span>
		</div>

		<!-- Description -->
		<p class="text-grey-600 leading-6 mb-4 line-clamp-3">
			{event.short_description}
		</p>

		<!-- CTA Button -->
		<a href="/akce/{event.slug}" class="btn-primary inline-block text-center">
			Zobrazit detail
		</a>
	</div>
</article>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// Transform API stats into dashboard cards
	$: statsCards = data.stats
		? [
				{
					label: 'Nadcházející akce',
					value: data.stats.events.upcoming,
					change: `${data.stats.events.published} publikovaných`,
					icon: 'calendar',
					color: 'pii-cyan'
				},
				{
					label: 'Celkem registrací',
					value: data.stats.registrations.confirmed,
					change: `+${data.stats.registrations.recentWeek} tento týden`,
					icon: 'users',
					color: 'success'
				},
				{
					label: 'Proběhlé akce',
					value: data.stats.events.past,
					change: 'Od začátku',
					icon: 'check',
					color: 'grey-600'
				},
				{
					label: 'Vytížení kapacity',
					value: `${data.stats.capacity.utilizationRate}%`,
					change: `${data.stats.capacity.occupied}/${data.stats.capacity.total}`,
					icon: 'chart',
					color: 'warning'
				}
		  ]
		: [];

	$: upcomingEvents = data.stats?.topEvents || [];
</script>

<div class="space-y-8">
	<!-- Page Header -->
	<div>
		<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-2">Dashboard</h1>
		<p class="text-grey-600 font-sans">Přehled aktivit a statistik</p>
	</div>

	<!-- Error State -->
	{#if data.error}
		<div class="bg-error/10 border border-error text-error p-6 rounded-lg">
			<p class="font-sans font-bold mb-2">⚠️ Chyba načítání dat</p>
			<p class="font-sans text-sm">{data.error}</p>
			<p class="font-sans text-sm mt-2">Zkontrolujte konfiguraci D1 databáze.</p>
		</div>
	{/if}

	<!-- Stats Grid -->
	{#if statsCards.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each statsCards as stat}
			<div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-{stat.color}">
				<div class="flex items-start justify-between mb-4">
					<div class="flex-1">
						<p class="text-grey-600 font-sans text-sm uppercase tracking-wide mb-1">
							{stat.label}
						</p>
						<p class="text-3xl font-bebas">{stat.value}</p>
					</div>
					<div class="bg-{stat.color}/10 p-3 rounded-lg">
						{#if stat.icon === 'calendar'}
							<svg
								class="w-6 h-6 text-{stat.color}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						{:else if stat.icon === 'users'}
							<svg
								class="w-6 h-6 text-{stat.color}"
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
						{:else if stat.icon === 'check'}
							<svg
								class="w-6 h-6 text-{stat.color}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						{:else if stat.icon === 'chart'}
							<svg
								class="w-6 h-6 text-{stat.color}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						{/if}
					</div>
				</div>
				<p class="text-grey-600 font-sans text-sm">{stat.change}</p>
			</div>
		{/each}
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<h2 class="font-bebas text-2xl uppercase mb-4">Rychlé akce</h2>
		<div class="flex flex-wrap gap-4">
			<a href="/admin/akce/nova" class="btn-primary"> + Vytvořit novou akci </a>
			<a href="/admin/akce" class="btn-outline"> Spravovat akce </a>
			<a href="/admin/nastaveni" class="btn-outline"> Nastavení </a>
		</div>
	</div>

	<!-- Upcoming Events -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<div class="flex items-center justify-between mb-6">
			<h2 class="font-bebas text-2xl uppercase">Nadcházející akce</h2>
			<a href="/admin/akce" class="text-pii-cyan font-sans text-sm hover:underline">
				Zobrazit vše →
			</a>
		</div>

		{#if upcomingEvents.length > 0}
			<div class="space-y-4">
				{#each upcomingEvents as event}
					<div
						class="flex flex-col md:flex-row md:items-center justify-between p-4 border border-grey-200 rounded-lg hover:border-pii-cyan transition-colors"
					>
						<div class="flex-1 mb-4 md:mb-0">
							<h3 class="font-serif text-lg font-bold mb-1">{event.title}</h3>
							<p class="text-grey-600 font-sans text-sm">
								{new Date(event.event_date).toLocaleDateString('cs-CZ')}
							</p>
						</div>

						<div class="flex items-center gap-4">
							<div class="text-center">
								<p class="text-2xl font-bebas">
									{event.current_registrations}/{event.max_capacity || '∞'}
								</p>
								<p class="text-grey-600 font-sans text-xs uppercase">Registrací</p>
							</div>

							<div class="flex gap-2">
								<a
									href="/admin/akce/{event.slug}"
									class="px-4 py-2 bg-grey-100 hover:bg-grey-200 rounded font-sans text-sm transition-colors"
								>
									Upravit
								</a>
								<a
									href="/admin/akce/{event.slug}/registrace"
									class="px-4 py-2 bg-pii-cyan hover:bg-pii-cyan/90 text-white rounded font-sans text-sm transition-colors"
								>
									Registrace
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-grey-600 font-sans text-center py-8">Žádné nadcházející akce</p>
		{/if}
	</div>

	<!-- Info Box -->
	<div class="bg-success/10 border border-success rounded-lg p-6">
		<h3 class="font-bebas text-xl uppercase mb-2 text-success">✅ Dashboard funguje s API</h3>
		<p class="text-grey-600 font-sans text-sm mb-4">
			Dashboard nyní zobrazuje reálná data z D1 databáze. Pokud vidíte chybu, zkontrolujte
			konfiguraci databáze.
		</p>
		<p class="text-grey-600 font-sans text-sm mb-2 font-bold">Co už funguje:</p>
		<ul class="text-grey-600 font-sans text-sm space-y-1 list-disc list-inside mb-4">
			<li>✅ Reálné statistiky z databáze</li>
			<li>✅ API pro správu akcí (CRUD operace)</li>
			<li>✅ Seznam registrací na akce</li>
		</ul>
		<p class="text-grey-600 font-sans text-sm mb-2 font-bold">V další fázi:</p>
		<ul class="text-grey-600 font-sans text-sm space-y-1 list-disc list-inside">
			<li>Autentizace a autorizace (JWT)</li>
			<li>Upload obrázků do R2</li>
			<li>Export registrací do CSV</li>
			<li>Email notifikace (Resend API)</li>
		</ul>
	</div>
</div>

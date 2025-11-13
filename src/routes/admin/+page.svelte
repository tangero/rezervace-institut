<script lang="ts">
	// Dashboard statistics - dummy data
	const stats = [
		{
			label: 'Nadcházející akce',
			value: 3,
			change: '+1 tento měsíc',
			icon: 'calendar',
			color: 'pii-cyan'
		},
		{
			label: 'Celkem registrací',
			value: 85,
			change: '+12 tento týden',
			icon: 'users',
			color: 'success'
		},
		{
			label: 'Proběhlé akce',
			value: 12,
			change: 'Od začátku roku',
			icon: 'check',
			color: 'grey-600'
		},
		{
			label: 'Průměrná účast',
			value: '72%',
			change: 'Z kapacity',
			icon: 'chart',
			color: 'warning'
		}
	];

	const upcomingEvents = [
		{
			title: 'Debata o budoucnosti Evropské unie',
			date: '15. 12. 2025',
			registrations: 35,
			capacity: 50,
			slug: 'debata-o-budoucnosti-eu'
		},
		{
			title: 'Workshop: Digitalizace veřejné správy',
			date: '20. 12. 2025',
			registrations: 8,
			capacity: 30,
			slug: 'workshop-digitalizace'
		},
		{
			title: 'Klimatická politika ČR v roce 2026',
			date: '10. 1. 2026',
			registrations: 42,
			capacity: 80,
			slug: 'klimaticka-politika-cr'
		}
	];
</script>

<div class="space-y-8">
	<!-- Page Header -->
	<div>
		<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-2">Dashboard</h1>
		<p class="text-grey-600 font-sans">Přehled aktivit a statistik</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat}
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

		<div class="space-y-4">
			{#each upcomingEvents as event}
				<div
					class="flex flex-col md:flex-row md:items-center justify-between p-4 border border-grey-200 rounded-lg hover:border-pii-cyan transition-colors"
				>
					<div class="flex-1 mb-4 md:mb-0">
						<h3 class="font-serif text-lg font-bold mb-1">{event.title}</h3>
						<p class="text-grey-600 font-sans text-sm">{event.date}</p>
					</div>

					<div class="flex items-center gap-4">
						<div class="text-center">
							<p class="text-2xl font-bebas">{event.registrations}/{event.capacity}</p>
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
	</div>

	<!-- Info Box -->
	<div class="bg-info/10 border border-info rounded-lg p-6">
		<h3 class="font-bebas text-xl uppercase mb-2 text-info">💡 Vítejte v admin panelu</h3>
		<p class="text-grey-600 font-sans text-sm mb-4">
			Toto je základní verze admin panelu. Aktuálně zobrazuje dummy data. V další fázi vývoje
			budou připojeny:
		</p>
		<ul class="text-grey-600 font-sans text-sm space-y-1 list-disc list-inside">
			<li>API pro správu akcí (CRUD operace)</li>
			<li>Autentizace a autorizace (JWT)</li>
			<li>Upload obrázků do R2</li>
			<li>Export registrací do CSV</li>
			<li>Reálné statistiky z databáze</li>
		</ul>
	</div>
</div>

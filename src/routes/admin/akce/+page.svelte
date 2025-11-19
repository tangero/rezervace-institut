<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: events = data.events || [];

	function getStatusBadge(status: string) {
		switch (status) {
			case 'published':
				return { color: 'bg-success text-white', label: 'Publikováno' };
			case 'draft':
				return { color: 'bg-grey-400 text-white', label: 'Koncept' };
			case 'cancelled':
				return { color: 'bg-error text-white', label: 'Zrušeno' };
			case 'completed':
				return { color: 'bg-grey-600 text-white', label: 'Dokončeno' };
			default:
				return { color: 'bg-grey-400 text-white', label: status };
		}
	}

	function getOccupancyColor(registrations: number, capacity: number | null) {
		if (!capacity) return 'text-grey-600';
		const percentage = (registrations / capacity) * 100;
		if (percentage >= 90) return 'text-error';
		if (percentage >= 70) return 'text-warning';
		return 'text-success';
	}

	function getOccupancyPercentage(registrations: number, capacity: number | null): number {
		if (!capacity) return 0;
		return Math.min((registrations / capacity) * 100, 100);
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-2">Správa akcí</h1>
			<p class="text-grey-600 font-sans">Přehled všech akcí a jejich stavu</p>
		</div>
		<a href="/admin/akce/nova" class="btn-primary"> + Vytvořit novou akci </a>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow-md p-4">
		<div class="flex flex-wrap gap-4">
			<select class="px-4 py-2 border border-grey-200 rounded font-sans text-sm">
				<option>Všechny stavy</option>
				<option>Publikováno</option>
				<option>Koncept</option>
				<option>Zrušeno</option>
				<option>Dokončeno</option>
			</select>

			<select class="px-4 py-2 border border-grey-200 rounded font-sans text-sm">
				<option>Všechny akce</option>
				<option>Nadcházející</option>
				<option>Proběhlé</option>
			</select>

			<input
				type="search"
				placeholder="Hledat akci..."
				class="flex-1 px-4 py-2 border border-grey-200 rounded font-sans text-sm"
			/>
		</div>
	</div>

	<!-- Events Table -->
	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		<!-- Desktop Table -->
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full">
				<thead class="bg-grey-100 border-b border-grey-200">
					<tr>
						<th class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600">
							Název akce
						</th>
						<th class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600">
							Datum
						</th>
						<th class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600">
							Registrace
						</th>
						<th class="px-6 py-3 text-left font-sans text-xs uppercase tracking-wide text-grey-600">
							Stav
						</th>
						<th class="px-6 py-3 text-right font-sans text-xs uppercase tracking-wide text-grey-600">
							Akce
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-grey-200">
					{#each events as event}
						{@const badge = getStatusBadge(event.status)}
						<tr class="hover:bg-grey-50 transition-colors">
							<td class="px-6 py-4">
								<a
									href="/admin/akce/{event.slug}"
									class="font-serif font-bold hover:text-pii-cyan transition-colors"
								>
									{event.title}
								</a>
							</td>
							<td class="px-6 py-4 font-sans text-sm text-grey-600">
								{new Date(event.event_date).toLocaleDateString('cs-CZ')}<br />
								<span class="text-xs">{event.start_time}</span>
							</td>
							<td class="px-6 py-4 font-sans text-sm">
								<span
									class={getOccupancyColor(
										event.current_registrations,
										event.max_capacity
									)}
								>
									<strong>{event.current_registrations}</strong> / {event.max_capacity ||
										'∞'}
								</span>
								<div class="w-full bg-grey-200 rounded-full h-1.5 mt-1">
									<div
										class="bg-pii-cyan h-1.5 rounded-full"
										style="width: {getOccupancyPercentage(
											event.current_registrations,
											event.max_capacity
										)}%"
									></div>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="px-3 py-1 rounded-full text-xs font-sans font-bold {badge.color}">
									{badge.label}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/akce/{event.slug}"
										target="_blank"
										class="p-2 hover:bg-grey-100 rounded transition-colors"
										title="Zobrazit na webu"
									>
										<svg
											class="w-4 h-4 text-grey-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											/>
										</svg>
									</a>
									<a
										href="/admin/akce/{event.slug}"
										class="p-2 hover:bg-grey-100 rounded transition-colors"
										title="Upravit"
									>
										<svg
											class="w-4 h-4 text-grey-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
											/>
										</svg>
									</a>
									<a
										href="/admin/akce/{event.slug}/registrace"
										class="p-2 hover:bg-grey-100 rounded transition-colors"
										title="Registrace"
									>
										<svg
											class="w-4 h-4 text-grey-600"
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
									</a>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Cards -->
		<div class="md:hidden divide-y divide-grey-200">
			{#each events as event}
				{@const badge = getStatusBadge(event.status)}
				<div class="p-4">
					<div class="flex items-start justify-between mb-3">
						<div class="flex-1">
							<a
								href="/admin/akce/{event.slug}"
								class="font-serif font-bold text-lg hover:text-pii-cyan transition-colors block mb-1"
							>
								{event.title}
							</a>
							<p class="text-grey-600 font-sans text-sm">
								{new Date(event.event_date).toLocaleDateString('cs-CZ')} • {event.start_time}
							</p>
						</div>
						<span class="px-2 py-1 rounded-full text-xs font-sans font-bold {badge.color}">
							{badge.label}
						</span>
					</div>

					<div class="mb-3">
						<div class="flex items-center justify-between mb-1">
							<span class="font-sans text-sm text-grey-600">Registrace</span>
							<span
								class="font-sans text-sm {getOccupancyColor(
									event.current_registrations,
									event.max_capacity
								)}"
							>
								<strong>{event.current_registrations}</strong> / {event.max_capacity || '∞'}
							</span>
						</div>
						<div class="w-full bg-grey-200 rounded-full h-2">
							<div
								class="bg-pii-cyan h-2 rounded-full"
								style="width: {getOccupancyPercentage(
									event.current_registrations,
									event.max_capacity
								)}%"
							></div>
						</div>
					</div>

					<div class="flex gap-2">
						<a
							href="/admin/akce/{event.slug}"
							class="flex-1 px-3 py-2 bg-grey-100 hover:bg-grey-200 rounded font-sans text-sm text-center transition-colors"
						>
							Upravit
						</a>
						<a
							href="/admin/akce/{event.slug}/registrace"
							class="flex-1 px-3 py-2 bg-pii-cyan hover:bg-pii-cyan/90 text-white rounded font-sans text-sm text-center transition-colors"
						>
							Registrace
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Empty State (if no events) -->
	<!-- {#if events.length === 0}
		<div class="bg-white rounded-lg shadow-md p-12 text-center">
			<div class="w-16 h-16 bg-grey-200 rounded-full flex items-center justify-center mx-auto mb-4">
				<svg class="w-8 h-8 text-grey-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
				</svg>
			</div>
			<h3 class="font-bebas text-2xl uppercase mb-2">Žádné akce</h3>
			<p class="text-grey-600 font-sans mb-4">Zatím jste nevytvořili žádné akce.</p>
			<a href="/admin/akce/nova" class="btn-primary">+ Vytvořit první akci</a>
		</div>
	{/if} -->
</div>

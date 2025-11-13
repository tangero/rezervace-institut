<script lang="ts">
	// Admin - Create new event
	// This is a placeholder - full form will be implemented in next phase

	let formData = {
		title: '',
		slug: '',
		short_description: '',
		long_description: '',
		program: '',
		event_date: '',
		start_time: '',
		duration_minutes: 120,
		venue_name: '',
		venue_address: '',
		max_capacity: null as number | null,
		is_paid: false,
		price_czk: 0,
		guest_names: '',
		image_url: ''
	};

	function generateSlug() {
		if (formData.title) {
			formData.slug = formData.title
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		alert('Vytvoření akce bude implementováno v další fázi.\n\nData formuláře:\n' + JSON.stringify(formData, null, 2));
	}
</script>

<div class="max-w-4xl">
	<!-- Page Header -->
	<div class="mb-8">
		<a href="/admin/akce" class="inline-flex items-center gap-2 text-pii-cyan hover:underline mb-4 font-sans">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
			</svg>
			<span>Zpět na seznam akcí</span>
		</a>
		<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-2">Vytvořit novou akci</h1>
		<p class="text-grey-600 font-sans">Vyplňte informace o nové akci</p>
	</div>

	<!-- Info Box -->
	<div class="bg-info/10 border border-info rounded-lg p-4 mb-6">
		<p class="text-grey-600 font-sans text-sm">
			⚠️ <strong>Poznámka:</strong> Toto je placeholder formulář. V další fázi vývoje bude implementováno:
		</p>
		<ul class="text-grey-600 font-sans text-sm mt-2 ml-4 list-disc">
			<li>Upload obrázků do Cloudflare R2</li>
			<li>WYSIWYG editor pro dlouhý popis a program</li>
			<li>Automatická validace a generování slug</li>
			<li>QR kód generování pro platby</li>
			<li>API integrace pro ukládání do D1</li>
		</ul>
	</div>

	<!-- Form -->
	<form on:submit={handleSubmit} class="bg-white rounded-lg shadow-md p-6 space-y-6">
		<!-- Title -->
		<div>
			<label for="title" class="block text-sm font-sans font-bold mb-2">
				Název akce *
			</label>
			<input
				type="text"
				id="title"
				bind:value={formData.title}
				on:blur={generateSlug}
				required
				placeholder="Debata o budoucnosti EU"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			/>
		</div>

		<!-- Slug -->
		<div>
			<label for="slug" class="block text-sm font-sans font-bold mb-2">
				URL slug *
			</label>
			<div class="flex items-center gap-2">
				<span class="text-grey-600 font-sans text-sm">/akce/</span>
				<input
					type="text"
					id="slug"
					bind:value={formData.slug}
					required
					placeholder="debata-o-budoucnosti-eu"
					class="flex-1 px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
			<p class="text-grey-600 font-sans text-xs mt-1">Automaticky generováno z názvu. Můžete upravit.</p>
		</div>

		<!-- Short Description -->
		<div>
			<label for="short_description" class="block text-sm font-sans font-bold mb-2">
				Krátký popis *
			</label>
			<textarea
				id="short_description"
				bind:value={formData.short_description}
				required
				rows="3"
				placeholder="Stručný popis akce pro náhled (max 200 znaků)"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			></textarea>
		</div>

		<!-- Date & Time -->
		<div class="grid md:grid-cols-3 gap-4">
			<div>
				<label for="event_date" class="block text-sm font-sans font-bold mb-2">
					Datum *
				</label>
				<input
					type="date"
					id="event_date"
					bind:value={formData.event_date}
					required
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
			<div>
				<label for="start_time" class="block text-sm font-sans font-bold mb-2">
					Čas začátku *
				</label>
				<input
					type="time"
					id="start_time"
					bind:value={formData.start_time}
					required
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
			<div>
				<label for="duration" class="block text-sm font-sans font-bold mb-2">
					Délka (minuty) *
				</label>
				<input
					type="number"
					id="duration"
					bind:value={formData.duration_minutes}
					required
					min="15"
					step="15"
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
		</div>

		<!-- Venue -->
		<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label for="venue_name" class="block text-sm font-sans font-bold mb-2">
					Místo konání
				</label>
				<input
					type="text"
					id="venue_name"
					bind:value={formData.venue_name}
					placeholder="Pirátské centrum Praha"
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
			<div>
				<label for="venue_address" class="block text-sm font-sans font-bold mb-2">
					Adresa *
				</label>
				<input
					type="text"
					id="venue_address"
					bind:value={formData.venue_address}
					required
					placeholder="Na Moráni 360/3, Praha 2"
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
		</div>

		<!-- Capacity -->
		<div>
			<label for="max_capacity" class="block text-sm font-sans font-bold mb-2">
				Maximální kapacita
			</label>
			<input
				type="number"
				id="max_capacity"
				bind:value={formData.max_capacity}
				placeholder="50"
				min="1"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			/>
			<p class="text-grey-600 font-sans text-xs mt-1">Ponechte prázdné pro neomezenou kapacitu</p>
		</div>

		<!-- Payment -->
		<div class="flex items-start gap-2">
			<input
				type="checkbox"
				id="is_paid"
				bind:checked={formData.is_paid}
				class="mt-1"
			/>
			<div class="flex-1">
				<label for="is_paid" class="block text-sm font-sans font-bold mb-2 cursor-pointer">
					Placená akce
				</label>
				{#if formData.is_paid}
					<input
						type="number"
						bind:value={formData.price_czk}
						placeholder="Cena v Kč"
						min="0"
						class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans mt-2"
					/>
				{/if}
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-4 pt-4 border-t border-grey-200">
			<button type="submit" class="btn-primary">
				Vytvořit akci
			</button>
			<a href="/admin/akce" class="btn-outline">
				Zrušit
			</a>
		</div>
	</form>
</div>

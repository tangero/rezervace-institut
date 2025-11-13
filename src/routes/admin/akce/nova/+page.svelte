<script lang="ts">
	import { goto } from '$app/navigation';
	import { authenticatedFetch } from '$lib/client/api';

	let loading = false;
	let error = '';
	let success = '';

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
		image_url: '',
		image_alt: '',
		status: 'draft' as 'draft' | 'published'
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

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		success = '';

		try {
			// Parse guest names from textarea (one per line)
			const guestNames = formData.guest_names
				.split('\n')
				.map((name) => name.trim())
				.filter((name) => name.length > 0);

			const createData = {
				...formData,
				guest_names: guestNames,
				is_paid: formData.is_paid ? 1 : 0
			};

			const response = await authenticatedFetch('/api/admin/events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(createData)
			});

			const result = await response.json();

			if (!response.ok) {
				error = result.error || 'Nepodařilo se vytvořit akci';
				if (result.suggestion) {
					error += `\n\nNavrhovaný slug: ${result.suggestion}`;
				}
				loading = false;
				return;
			}

			success = 'Akce byla úspěšně vytvořena! Přesměrování...';
			setTimeout(() => {
				goto('/admin/akce');
			}, 1500);
		} catch (err) {
			console.error('Error creating event:', err);
			error = 'Chyba při vytváření akce';
			loading = false;
		}
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

	<!-- Messages -->
	{#if error}
		<div class="bg-error/10 border border-error text-error p-4 rounded-lg mb-6">
			<p class="font-sans text-sm whitespace-pre-line">{error}</p>
		</div>
	{/if}

	{#if success}
		<div class="bg-success/10 border border-success text-success p-4 rounded-lg mb-6">
			<p class="font-sans text-sm">{success}</p>
		</div>
	{/if}

	<!-- Form -->
	<form on:submit={handleSubmit} class="bg-white rounded-lg shadow-md p-6 space-y-6">
		<!-- Status -->
		<div>
			<label for="status" class="block text-sm font-sans font-bold mb-2"> Status * </label>
			<select
				id="status"
				bind:value={formData.status}
				required
				disabled={loading}
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			>
				<option value="draft">Koncept (Draft) - neuveřejněná akce</option>
				<option value="published">Publikovat ihned</option>
			</select>
		</div>

		<!-- Title -->
		<div>
			<label for="title" class="block text-sm font-sans font-bold mb-2"> Název akce * </label>
			<input
				type="text"
				id="title"
				bind:value={formData.title}
				on:blur={generateSlug}
				required
				disabled={loading}
				placeholder="Debata o budoucnosti EU"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			/>
		</div>

		<!-- Slug -->
		<div>
			<label for="slug" class="block text-sm font-sans font-bold mb-2"> URL slug * </label>
			<div class="flex items-center gap-2">
				<span class="text-grey-600 font-sans text-sm">/akce/</span>
				<input
					type="text"
					id="slug"
					bind:value={formData.slug}
					required
					disabled={loading}
					placeholder="debata-o-budoucnosti-eu"
					class="flex-1 px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
			<p class="text-grey-600 font-sans text-xs mt-1">
				Automaticky generováno z názvu. Můžete upravit.
			</p>
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
				disabled={loading}
				rows="3"
				placeholder="Stručný popis akce pro náhled"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			></textarea>
		</div>

		<!-- Long Description -->
		<div>
			<label for="long_description" class="block text-sm font-sans font-bold mb-2">
				Dlouhý popis
			</label>
			<textarea
				id="long_description"
				bind:value={formData.long_description}
				disabled={loading}
				rows="6"
				placeholder="Detailní popis akce (podporuje HTML)"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			></textarea>
			<p class="text-grey-600 font-sans text-xs mt-1">
				Můžete použít HTML tagy: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, atd.
			</p>
		</div>

		<!-- Program -->
		<div>
			<label for="program" class="block text-sm font-sans font-bold mb-2"> Program akce </label>
			<textarea
				id="program"
				bind:value={formData.program}
				disabled={loading}
				rows="6"
				placeholder="<ul><li><strong>18:00 - 18:15:</strong> Úvod</li>...</ul>"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			></textarea>
			<p class="text-grey-600 font-sans text-xs mt-1">Podporuje HTML</p>
		</div>

		<!-- Date & Time -->
		<div class="grid md:grid-cols-3 gap-4">
			<div>
				<label for="event_date" class="block text-sm font-sans font-bold mb-2"> Datum * </label>
				<input
					type="date"
					id="event_date"
					bind:value={formData.event_date}
					required
					disabled={loading}
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
					disabled={loading}
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
					disabled={loading}
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
					Místo konání *
				</label>
				<input
					type="text"
					id="venue_name"
					bind:value={formData.venue_name}
					required
					disabled={loading}
					placeholder="Pirátské centrum Praha"
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
			<div>
				<label for="venue_address" class="block text-sm font-sans font-bold mb-2"> Adresa * </label>
				<input
					type="text"
					id="venue_address"
					bind:value={formData.venue_address}
					required
					disabled={loading}
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
				disabled={loading}
				placeholder="Nevyplněno = neomezená kapacita"
				min="1"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			/>
			<p class="text-grey-600 font-sans text-xs mt-1">
				Pokud nevyplníte, kapacita nebude omezena
			</p>
		</div>

		<!-- Payment -->
		<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={formData.is_paid} disabled={loading} class="w-5 h-5" />
					<span class="font-sans font-bold text-sm">Akce je zpoplatněná</span>
				</label>
			</div>
			{#if formData.is_paid}
				<div>
					<label for="price_czk" class="block text-sm font-sans font-bold mb-2"> Cena (Kč) * </label>
					<input
						type="number"
						id="price_czk"
						bind:value={formData.price_czk}
						min="0"
						disabled={loading}
						required={formData.is_paid}
						class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
					/>
				</div>
			{/if}
		</div>

		<!-- Guest Names -->
		<div>
			<label for="guest_names" class="block text-sm font-sans font-bold mb-2">
				Hosté / Řečníci
			</label>
			<textarea
				id="guest_names"
				bind:value={formData.guest_names}
				disabled={loading}
				rows="4"
				placeholder="Dr. Jan Novák&#10;Prof. Marie Svobodová&#10;Mgr. Petr Dvořák"
				class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
			></textarea>
			<p class="text-grey-600 font-sans text-xs mt-1">Každý řádek = jeden host</p>
		</div>

		<!-- Image -->
		<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label for="image_url" class="block text-sm font-sans font-bold mb-2"> URL obrázku </label>
				<input
					type="url"
					id="image_url"
					bind:value={formData.image_url}
					disabled={loading}
					placeholder="https://example.com/image.jpg"
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
				<p class="text-grey-600 font-sans text-xs mt-1">TODO: Upload do R2</p>
			</div>
			<div>
				<label for="image_alt" class="block text-sm font-sans font-bold mb-2">
					Alt text obrázku
				</label>
				<input
					type="text"
					id="image_alt"
					bind:value={formData.image_alt}
					disabled={loading}
					placeholder="Popis obrázku pro nevidomé"
					class="w-full px-4 py-3 border border-grey-200 rounded focus:outline-none focus:border-pii-cyan font-sans"
				/>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-4 pt-4 border-t border-grey-200">
			<button
				type="submit"
				disabled={loading}
				class="btn-primary {loading ? 'opacity-50 cursor-not-allowed' : ''}"
			>
				{#if loading}
					Vytváření...
				{:else}
					💾 Vytvořit akci
				{/if}
			</button>
			<button type="button" on:click={() => goto('/admin/akce')} disabled={loading} class="btn-outline">
				Zrušit
			</button>
		</div>
	</form>
</div>

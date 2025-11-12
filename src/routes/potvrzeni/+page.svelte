<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let success = false;
	let already = false;

	onMount(() => {
		success = $page.url.searchParams.get('success') === 'true';
		already = $page.url.searchParams.get('already') === 'true';
	});
</script>

<svelte:head>
	<title>Potvrzení registrace - Institut Pí</title>
</svelte:head>

<section class="py-12 md:py-20">
	<div class="container mx-auto px-4 max-w-2xl">
		{#if success}
			<!-- Success State -->
			<div class="text-center">
				<div
					class="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
				>
					<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-4">Registrace potvrzena!</h1>

				<p class="text-lg text-grey-600 mb-6 leading-7">
					Děkujeme za potvrzení registrace. Těšíme se na setkání s vámi na akci.
				</p>

				<div class="bg-grey-100 rounded-lg p-6 mb-8">
					<h2 class="font-serif text-xl font-bold mb-3">Co dál?</h2>
					<ul class="text-left space-y-2 text-grey-600">
						<li class="flex items-start gap-2">
							<svg class="w-5 h-5 text-pii-cyan mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Obdrželi jste potvrzovací email s detaily akce</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="w-5 h-5 text-pii-cyan mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Pár dní před akcí vám přijde připomínka</span>
						</li>
						<li class="flex items-start gap-2">
							<svg class="w-5 h-5 text-pii-cyan mt-0.5" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>Nezapomeňte si akci přidat do kalendáře</span>
						</li>
					</ul>
				</div>

				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="/" class="btn-primary"> Zpět na akce </a>
					<a
						href="https://www.institutpi.cz"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-outline"
					>
						Navštívit institutpi.cz
					</a>
				</div>
			</div>
		{:else if already}
			<!-- Already Confirmed State -->
			<div class="text-center">
				<div
					class="w-20 h-20 bg-info rounded-full flex items-center justify-center mx-auto mb-6"
				>
					<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>

				<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-4">Již potvrzeno</h1>

				<p class="text-lg text-grey-600 mb-8 leading-7">
					Vaše registrace již byla dříve potvrzena. Těšíme se na vás!
				</p>

				<a href="/" class="btn-primary"> Zpět na akce </a>
			</div>
		{:else}
			<!-- Error State -->
			<div class="text-center">
				<div
					class="w-20 h-20 bg-error rounded-full flex items-center justify-center mx-auto mb-6"
				>
					<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</div>

				<h1 class="font-bebas text-4xl md:text-5xl uppercase mb-4">Něco se pokazilo</h1>

				<p class="text-lg text-grey-600 mb-8 leading-7">
					Omlouváme se, ale nepodařilo se potvrdit registraci. Zkuste to prosím znovu nebo nás
					kontaktujte.
				</p>

				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a href="/" class="btn-primary"> Zpět na akce </a>
					<a
						href="mailto:patrick.zandl@institutpi.cz"
						class="btn-outline"
					>
						Kontaktovat podporu
					</a>
				</div>
			</div>
		{/if}
	</div>
</section>

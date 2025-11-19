<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';

	const siteInfo = {
		title: 'Institut Pí',
		description: 'Vzdělávací a komunitní akce pro osobní i profesní rozvoj.',
		url: 'https://akce.institutpi.cz',
		ogImage: 'https://akce.institutpi.cz/default-og-image.jpg' // Placeholder
	};
</script>

<svelte:head>
	<title>{$page.data.title || siteInfo.title}</title>
	<meta name="description" content={$page.data.description || siteInfo.description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:title" content={$page.data.title || siteInfo.title} />
	<meta property="og:description" content={$page.data.description || siteInfo.description} />
	<meta property="og:image" content={$page.data.ogImage || siteInfo.ogImage} />
	<meta property="og:site_name" content={siteInfo.title} />
	<meta property="og:locale" content="cs_CZ" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={$page.url.href} />
	<meta property="twitter:title" content={$page.data.title || siteInfo.title} />
	<meta property="twitter:description" content={$page.data.description || siteInfo.description} />
	<meta property="twitter:image" content={$page.data.ogImage || siteInfo.ogImage} />

	<!-- Other -->
	<meta name="theme-color" content="#2782AF" />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header />


	<main class="flex-1">
		<slot />
	</main>

	<Footer />
</div>

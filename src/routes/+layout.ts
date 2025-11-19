// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ url }) => {
	return {
		// Base data for all pages, can be overridden by specific page loaders
		title: 'Institut Pí - Akce a rezervace',
		description: 'Přehled vzdělávacích a komunitních akcí pro osobní i profesní rozvoj pořádaných Institutem Pí.',
		ogImage: 'https://akce.institutpi.cz/default-og-image.jpg', // Default OG image
		url: url.href
	};
};

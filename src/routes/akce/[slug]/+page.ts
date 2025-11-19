import type { PageLoad } from './$types';
import type { Event, ApiResponse } from '../../../../workers/types';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const res = await fetch(`/api/events/${params.slug}`);

		if (!res.ok) {
			const errorData: ApiResponse<null> = await res.json();
			throw new Error(errorData.error || `Failed to fetch event: ${res.statusText}`);
		}

		const response: ApiResponse<Event & { available_spots: number | null }> = await res.json();
		const event = response.data;

		return {
			event,
			// SEO data for <svelte:head> in root layout
			title: `${event.title} | Institut Pí`,
			description: event.short_description,
			ogImage: event.image_url || 'https://akce.institutpi.cz/default-og-image.jpg'
		};
	} catch (error: any) {
		return {
			status: 500,
			error: new Error(`Could not load event. Reason: ${error.message}`),
			// Provide fallback SEO data on error
			title: 'Chyba',
			description: 'Tato akce nemohla být načtena.'
		};
	}
};


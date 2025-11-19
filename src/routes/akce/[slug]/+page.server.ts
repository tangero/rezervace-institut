// Server-side data loading for event detail page
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		// Fetch event from our API endpoint
		const response = await fetch(`/api/events/${slug}`);

		if (response.status === 404) {
			throw error(404, {
				message: 'Akce nebyla nalezena'
			});
		}

		if (!response.ok) {
			console.error('Failed to fetch event:', response.statusText);
			throw error(500, {
				message: 'Nepodařilo se načíst údaje o akci'
			});
		}

		const event = await response.json();

		// Calculate available spots
		const availableSpots = event.max_capacity
			? event.max_capacity - event.current_registrations
			: null;

		return {
			event: {
				...event,
				available_spots: availableSpots
			}
		};
	} catch (err: any) {
		// Re-throw SvelteKit errors (404, 500, etc.)
		if (err.status) {
			throw err;
		}

		// Handle unexpected errors
		console.error('Error loading event:', err);
		throw error(500, {
			message: 'Nepodařilo se načíst údaje o akci'
		});
	}
};

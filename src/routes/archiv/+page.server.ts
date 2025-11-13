// Server-side data loading for archive page
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch archived events from our API endpoint
		const response = await fetch('/api/events?archive=true&limit=50');

		if (!response.ok) {
			console.error('Failed to fetch archive events:', response.statusText);
			return {
				events: [],
				total: 0
			};
		}

		const data = await response.json();

		return {
			events: data.events || [],
			total: data.total || 0
		};
	} catch (error) {
		console.error('Error loading archive events:', error);
		return {
			events: [],
			total: 0
		};
	}
};

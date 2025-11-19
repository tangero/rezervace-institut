// Server-side data loading for homepage
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch events from our API endpoint
		const response = await fetch('/api/events?limit=10');

		if (!response.ok) {
			console.error('Failed to fetch events:', response.statusText);
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
		console.error('Error loading events:', error);
		return {
			events: [],
			total: 0
		};
	}
};

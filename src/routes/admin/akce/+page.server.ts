// Server-side data loading for admin events list
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const status = url.searchParams.get('status') || '';
		const limit = url.searchParams.get('limit') || '50';

		// Build API URL with query params
		const apiUrl = `/api/admin/events?limit=${limit}${status ? `&status=${status}` : ''}`;

		// Fetch events from admin API
		const response = await fetch(apiUrl);

		if (!response.ok) {
			console.error('Failed to fetch admin events:', response.statusText);
			return {
				events: [],
				total: 0,
				error: 'Nepodařilo se načíst akce'
			};
		}

		const data = await response.json();

		return {
			events: data.events || [],
			total: data.total || 0,
			error: null
		};
	} catch (error) {
		console.error('Error loading admin events:', error);
		return {
			events: [],
			total: 0,
			error: 'Chyba při načítání dat'
		};
	}
};

// Server-side data loading for admin dashboard
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		// Fetch statistics from admin API
		const response = await fetch('/api/admin/stats');

		if (!response.ok) {
			console.error('Failed to fetch admin stats:', response.statusText);
			return {
				stats: null,
				error: 'Nepodařilo se načíst statistiky'
			};
		}

		const stats = await response.json();

		return {
			stats,
			error: null
		};
	} catch (error) {
		console.error('Error loading admin dashboard:', error);
		return {
			stats: null,
			error: 'Chyba při načítání dat'
		};
	}
};

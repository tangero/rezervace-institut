// API endpoint: GET /api/events/:slug - Get event by slug
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, params }) => {
	try {
		const { slug } = params;
		const db = platform?.env?.DB;

		if (!db) {
			console.error('❌ D1 database not available!');
			console.error('Debug info:', {
				slug,
				platform: platform ? 'exists' : 'missing',
				env: platform?.env ? 'exists' : 'missing',
				DB: platform?.env?.DB ? 'exists' : 'missing',
				availableBindings: platform?.env ? Object.keys(platform.env) : []
			});
			console.error('💡 Fix: Run database setup script: cd database && ./setup-db.sh');

			return json(
				{
					error: 'Database not configured',
					message: 'D1 database není nakonfigurována. Spusťte: cd database && ./setup-db.sh',
					debug: {
						requestedSlug: slug,
						platform: !!platform,
						env: !!platform?.env,
						dbBinding: !!platform?.env?.DB,
						availableBindings: platform?.env ? Object.keys(platform.env) : []
					}
				},
				{ status: 503 }
			);
		}

		// Query event from D1
		const query = `
			SELECT * FROM events
			WHERE slug = ?
			AND status = 'published'
		`;

		const event = await db.prepare(query).bind(slug).first();

		if (!event) {
			throw error(404, 'Event not found');
		}

		// Parse guest_names from JSON string
		const parsedEvent = {
			...event,
			guest_names: event.guest_names ? JSON.parse(event.guest_names as string) : []
		};

		return json(parsedEvent);
	} catch (err) {
		console.error('Error fetching event:', err);
		if ((err as any).status === 404) {
			throw err;
		}
		return json(
			{
				error: 'Failed to fetch event'
			},
			{ status: 500 }
		);
	}
};

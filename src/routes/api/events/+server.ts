// API endpoint: GET /api/events - List published events
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, url }) => {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const status = url.searchParams.get('status') || 'published';
		const archive = url.searchParams.get('archive') === 'true';

		// Access D1 database via platform binding
		const db = platform?.env?.DB;

		if (!db) {
			console.error('❌ D1 database not available!');
			console.error('Debug info:', {
				platform: platform ? 'exists' : 'missing',
				env: platform?.env ? 'exists' : 'missing',
				DB: platform?.env?.DB ? 'exists' : 'missing',
				availableBindings: platform?.env ? Object.keys(platform.env) : []
			});
			console.error(
				'💡 Fix: Run database setup script: cd database && ./setup-db.sh'
			);

			return json(
				{
					error: 'Database not configured',
					message:
						'D1 database není nakonfigurována. Spusťte: cd database && ./setup-db.sh',
					debug: {
						platform: !!platform,
						env: !!platform?.env,
						dbBinding: !!platform?.env?.DB,
						availableBindings: platform?.env ? Object.keys(platform.env) : []
					}
				},
				{ status: 503 }
			);
		}

		// Get today's date in ISO format
		const today = new Date().toISOString().split('T')[0];

		// Build query based on archive mode
		const dateCondition = archive ? 'event_date < ?' : 'event_date >= ?';
		const orderDirection = archive ? 'DESC' : 'ASC';

		// Query events from D1
		const query = `
			SELECT * FROM events
			WHERE status = ?
			AND ${dateCondition}
			ORDER BY event_date ${orderDirection}, start_time ${orderDirection}
			LIMIT ? OFFSET ?
		`;

		const { results } = await db.prepare(query).bind(status, today, limit, offset).all();

		// Get total count
		const countQuery = `
			SELECT COUNT(*) as count FROM events
			WHERE status = ?
			AND ${dateCondition}
		`;

		const countResult = await db.prepare(countQuery).bind(status, today).first();

		return json({
			events: results || [],
			total: countResult?.count || 0
		});
	} catch (error) {
		console.error('Error fetching events:', error);
		return json(
			{
				error: 'Failed to fetch events'
			},
			{ status: 500 }
		);
	}
};

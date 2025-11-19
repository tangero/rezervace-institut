// API endpoint: GET /api/admin/events/:id/registrations - Get registrations for event
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request, params, platform, url }) => {
	try {
		// Verify authentication
		await requireAuth(request);

		const { id } = params;
		const includeUnconfirmed = url.searchParams.get('include_unconfirmed') === 'true';

		const db = platform?.env?.DB;

		if (!db) {
			console.error('❌ D1 database not available!');
			return json(
				{
					error: 'Database not configured'
				},
				{ status: 503 }
			);
		}

		// Check if event exists
		const event = await db
			.prepare('SELECT id, title, slug FROM events WHERE id = ?')
			.bind(id)
			.first();

		if (!event) {
			return json(
				{
					error: 'Event not found'
				},
				{ status: 404 }
			);
		}

		// Get registrations
		let query = `
			SELECT
				id,
				email,
				is_confirmed,
				payment_status,
				registered_at,
				confirmed_at,
				payment_confirmed_at
			FROM registrations
			WHERE event_id = ?
		`;

		if (!includeUnconfirmed) {
			query += ' AND is_confirmed = 1';
		}

		query += ' ORDER BY registered_at DESC';

		const { results } = await db.prepare(query).bind(id).all();

		// Get counts
		const confirmedCount = await db
			.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND is_confirmed = 1')
			.bind(id)
			.first();

		const pendingCount = await db
			.prepare('SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND is_confirmed = 0')
			.bind(id)
			.first();

		return json({
			event: {
				id: event.id,
				title: event.title,
				slug: event.slug
			},
			registrations: results || [],
			counts: {
				total: (results || []).length,
				confirmed: confirmedCount?.count || 0,
				pending: pendingCount?.count || 0
			}
		});
	} catch (error) {
		console.error('Error fetching registrations:', error);
		return json(
			{
				error: 'Failed to fetch registrations'
			},
			{ status: 500 }
		);
	}
};

// API endpoint: GET /api/admin/stats - Dashboard statistics
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: Add JWT authentication middleware

export const GET: RequestHandler = async ({ platform }) => {
	try {
		// TODO: Verify JWT token

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

		const today = new Date().toISOString().split('T')[0];

		// Get counts for different event statuses
		const publishedCount = await db
			.prepare('SELECT COUNT(*) as count FROM events WHERE status = ?')
			.bind('published')
			.first();

		const draftCount = await db
			.prepare('SELECT COUNT(*) as count FROM events WHERE status = ?')
			.bind('draft')
			.first();

		const upcomingCount = await db
			.prepare('SELECT COUNT(*) as count FROM events WHERE status = ? AND event_date >= ?')
			.bind('published', today)
			.first();

		const pastCount = await db
			.prepare('SELECT COUNT(*) as count FROM events WHERE status = ? AND event_date < ?')
			.bind('published', today)
			.first();

		// Get total registrations count
		const totalRegistrations = await db
			.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_confirmed = 1')
			.first();

		const pendingRegistrations = await db
			.prepare('SELECT COUNT(*) as count FROM registrations WHERE is_confirmed = 0')
			.first();

		// Get upcoming events with most registrations
		const topEvents = await db
			.prepare(
				`SELECT id, title, slug, event_date, current_registrations, max_capacity
				FROM events
				WHERE status = 'published' AND event_date >= ?
				ORDER BY current_registrations DESC
				LIMIT 5`
			)
			.bind(today)
			.all();

		// Get recent registrations (last 7 days)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

		const recentRegistrationsCount = await db
			.prepare(
				'SELECT COUNT(*) as count FROM registrations WHERE registered_at >= ? AND is_confirmed = 1'
			)
			.bind(sevenDaysAgoStr)
			.first();

		// Calculate total capacity and utilization
		const capacityStats = await db
			.prepare(
				`SELECT
					SUM(max_capacity) as total_capacity,
					SUM(current_registrations) as total_registered
				FROM events
				WHERE status = 'published' AND event_date >= ? AND max_capacity IS NOT NULL`
			)
			.bind(today)
			.first();

		const utilizationRate =
			capacityStats?.total_capacity > 0
				? Math.round((capacityStats.total_registered / capacityStats.total_capacity) * 100)
				: 0;

		return json({
			events: {
				total: (publishedCount?.count || 0) + (draftCount?.count || 0),
				published: publishedCount?.count || 0,
				draft: draftCount?.count || 0,
				upcoming: upcomingCount?.count || 0,
				past: pastCount?.count || 0
			},
			registrations: {
				total: totalRegistrations?.count || 0,
				pending: pendingRegistrations?.count || 0,
				confirmed: totalRegistrations?.count || 0,
				recentWeek: recentRegistrationsCount?.count || 0
			},
			capacity: {
				total: capacityStats?.total_capacity || 0,
				occupied: capacityStats?.total_registered || 0,
				available:
					(capacityStats?.total_capacity || 0) - (capacityStats?.total_registered || 0),
				utilizationRate
			},
			topEvents: topEvents?.results || []
		});
	} catch (error) {
		console.error('Error fetching stats:', error);
		return json(
			{
				error: 'Failed to fetch statistics',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

// Admin Statistics API endpoint

import type { Env } from '../types';
import { successResponse, errorResponse } from '../utils';

/**
 * GET /api/admin/stats
 * Get various statistics for the admin dashboard
 */
export async function getAdminStats(request: Request, env: Env): Promise<Response> {
	try {
		// D1's `batch` is perfect for this, as it executes all queries in a single transaction.
		const batchResults = await env.DB.batch([
			env.DB.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'published' AND date(event_date) >= date('now')"),
			env.DB.prepare("SELECT COUNT(*) as count FROM registrations WHERE is_confirmed = 1 AND payment_status != 'cancelled'"),
			env.DB.prepare("SELECT COUNT(*) as count FROM registrations WHERE is_confirmed = 0 AND payment_status = 'pending'"),
			env.DB.prepare("SELECT SUM(price_czk) as total FROM events e JOIN registrations r ON e.id = r.event_id WHERE r.payment_status = 'paid'"),
		]);

		const stats = {
			upcoming_events: batchResults[0].results[0]?.count ?? 0,
			active_registrations: batchResults[1].results[0]?.count ?? 0,
			pending_confirmations: batchResults[2].results[0]?.count ?? 0,
			total_revenue: batchResults[3].results[0]?.total ?? 0,
		};

		return successResponse(stats);

	} catch (error) {
		console.error('Error fetching admin stats:', error);
		return errorResponse('Failed to fetch statistics from database', 500);
	}
}

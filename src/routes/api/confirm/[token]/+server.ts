// API endpoint: GET /api/confirm/:token - Confirm registration
import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		const { token } = params;

		if (!token) {
			return json(
				{
					error: 'Token potvrzení je povinný'
				},
				{ status: 400 }
			);
		}

		// Access D1 database via platform binding
		const db = platform?.env?.DB;

		if (!db) {
			console.error('❌ D1 database not available - cannot confirm registration!');
			console.error('Debug info:', {
				token,
				platform: platform ? 'exists' : 'missing',
				env: platform?.env ? 'exists' : 'missing',
				DB: platform?.env?.DB ? 'exists' : 'missing',
				availableBindings: platform?.env ? Object.keys(platform.env) : []
			});
			console.error('💡 Fix: Run database setup script: cd database && ./setup-db.sh');

			return json(
				{
					error: 'Database not configured',
					message: 'Potvrzení registrace není momentálně dostupné. D1 database není nakonfigurována.',
					debug: {
						token,
						platform: !!platform,
						env: !!platform?.env,
						dbBinding: !!platform?.env?.DB,
						availableBindings: platform?.env ? Object.keys(platform.env) : []
					}
				},
				{ status: 503 }
			);
		}

		// Find registration by confirmation token
		const registration = await db
			.prepare('SELECT id, event_id, email, is_confirmed FROM registrations WHERE confirmation_token = ?')
			.bind(token)
			.first();

		if (!registration) {
			return json(
				{
					error: 'Neplatný nebo vypršelý potvrzovací token'
				},
				{ status: 404 }
			);
		}

		// Check if already confirmed
		if (registration.is_confirmed) {
			// Already confirmed, redirect with info
			throw redirect(303, `/potvrzeni?already=true`);
		}

		// Update registration to confirmed
		const now = new Date().toISOString();
		await db
			.prepare('UPDATE registrations SET is_confirmed = 1, confirmed_at = ? WHERE id = ?')
			.bind(now, registration.id)
			.run();

		// Get event details for confirmation page
		const event = await db
			.prepare('SELECT slug, title FROM events WHERE id = ?')
			.bind(registration.event_id)
			.first();

		// Redirect to confirmation page with success
		const redirectUrl = `/potvrzeni?success=true${event ? `&event=${event.slug}` : ''}`;
		throw redirect(303, redirectUrl);
	} catch (err: any) {
		// Re-throw redirect responses
		if (err.status === 303) {
			throw err;
		}

		console.error('Error confirming registration:', err);
		return json(
			{
				error: 'Nepodařilo se potvrdit registraci'
			},
			{ status: 500 }
		);
	}
};

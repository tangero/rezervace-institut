// API endpoint: GET /api/admin/events - List all events for admin (including drafts)
// POST /api/admin/events - Create new event
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';

// Generate unique event ID
function generateEventId(): string {
	return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Generate slug from title
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export const GET: RequestHandler = async ({ request, platform, url }) => {
	try {
		// Verify authentication
		await requireAuth(request);

		const limit = parseInt(url.searchParams.get('limit') || '100');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const status = url.searchParams.get('status'); // Optional filter by status

		const db = platform?.env?.DB;

		if (!db) {
			console.error('❌ D1 database not available!');
			console.error('💡 Fix: Run database setup script: cd database && ./setup-db.sh');

			return json(
				{
					error: 'Database not configured',
					message: 'D1 database není nakonfigurována.'
				},
				{ status: 503 }
			);
		}

		// Build query - admin can see all events regardless of status
		let query = 'SELECT * FROM events';
		const params: any[] = [];

		if (status) {
			query += ' WHERE status = ?';
			params.push(status);
		}

		query += ' ORDER BY event_date DESC, created_at DESC LIMIT ? OFFSET ?';
		params.push(limit, offset);

		const { results } = await db.prepare(query).bind(...params).all();

		// Get total count
		let countQuery = 'SELECT COUNT(*) as count FROM events';
		const countParams: any[] = [];

		if (status) {
			countQuery += ' WHERE status = ?';
			countParams.push(status);
		}

		const countResult = await db.prepare(countQuery).bind(...countParams).first();

		return json({
			events: results || [],
			total: countResult?.count || 0
		});
	} catch (error) {
		console.error('Error fetching admin events:', error);
		return json(
			{
				error: 'Failed to fetch events'
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		// Verify authentication
		await requireAuth(request);

		const db = platform?.env?.DB;

		if (!db) {
			console.error('❌ D1 database not available!');
			return json(
				{
					error: 'Database not configured',
					message: 'D1 database není nakonfigurována.'
				},
				{ status: 503 }
			);
		}

		const body = await request.json();

		// Validate required fields
		const requiredFields = [
			'title',
			'short_description',
			'event_date',
			'start_time',
			'duration_minutes',
			'venue_name',
			'venue_address'
		];

		for (const field of requiredFields) {
			if (!body[field]) {
				return json(
					{
						error: `Missing required field: ${field}`
					},
					{ status: 400 }
				);
			}
		}

		// Generate ID and slug
		const eventId = generateEventId();
		const slug = body.slug || generateSlug(body.title);

		// Check if slug already exists
		const existingEvent = await db
			.prepare('SELECT id FROM events WHERE slug = ?')
			.bind(slug)
			.first();

		if (existingEvent) {
			return json(
				{
					error: 'Event with this slug already exists',
					suggestion: `${slug}-${Date.now()}`
				},
				{ status: 400 }
			);
		}

		const now = new Date().toISOString();

		// Prepare guest names as JSON string
		const guestNamesJson = body.guest_names
			? JSON.stringify(Array.isArray(body.guest_names) ? body.guest_names : [body.guest_names])
			: JSON.stringify([]);

		// Insert event
		await db
			.prepare(
				`INSERT INTO events (
					id, slug, title, short_description, long_description, program,
					image_url, image_alt, venue_name, venue_address,
					event_date, start_time, duration_minutes, guest_names,
					is_paid, price_czk, payment_qr_data, payment_account, payment_variable_symbol,
					max_capacity, current_registrations, status, created_at, updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				eventId,
				slug,
				body.title,
				body.short_description,
				body.long_description || null,
				body.program || null,
				body.image_url || null,
				body.image_alt || null,
				body.venue_name,
				body.venue_address,
				body.event_date,
				body.start_time,
				body.duration_minutes,
				guestNamesJson,
				body.is_paid ? 1 : 0,
				body.price_czk || 0,
				body.payment_qr_data || null,
				body.payment_account || null,
				body.payment_variable_symbol || null,
				body.max_capacity || null,
				0, // current_registrations starts at 0
				body.status || 'draft',
				now,
				now
			)
			.run();

		console.log(`✅ Created event: ${eventId} (${slug})`);

		return json(
			{
				success: true,
				message: 'Event created successfully',
				event: {
					id: eventId,
					slug
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error creating event:', error);
		return json(
			{
				error: 'Failed to create event',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

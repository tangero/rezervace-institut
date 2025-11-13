// API endpoints for individual event management
// GET /api/admin/events/:id - Get single event
// PUT /api/admin/events/:id - Update event
// DELETE /api/admin/events/:id - Delete event
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: Add JWT authentication middleware

export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		// TODO: Verify JWT token

		const { id } = params;
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

		const event = await db.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();

		if (!event) {
			return json(
				{
					error: 'Event not found'
				},
				{ status: 404 }
			);
		}

		// Parse guest_names from JSON
		const parsedEvent = {
			...event,
			guest_names: event.guest_names ? JSON.parse(event.guest_names as string) : []
		};

		return json(parsedEvent);
	} catch (error) {
		console.error('Error fetching event:', error);
		return json(
			{
				error: 'Failed to fetch event'
			},
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	try {
		// TODO: Verify JWT token

		const { id } = params;
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
		const existingEvent = await db.prepare('SELECT id FROM events WHERE id = ?').bind(id).first();

		if (!existingEvent) {
			return json(
				{
					error: 'Event not found'
				},
				{ status: 404 }
			);
		}

		const body = await request.json();

		// Build update query dynamically based on provided fields
		const updates: string[] = [];
		const params: any[] = [];

		// List of allowed fields to update
		const allowedFields = [
			'title',
			'slug',
			'short_description',
			'long_description',
			'program',
			'image_url',
			'image_alt',
			'venue_name',
			'venue_address',
			'event_date',
			'start_time',
			'duration_minutes',
			'is_paid',
			'price_czk',
			'payment_qr_data',
			'payment_account',
			'payment_variable_symbol',
			'max_capacity',
			'status'
		];

		for (const field of allowedFields) {
			if (body[field] !== undefined) {
				updates.push(`${field} = ?`);
				params.push(body[field]);
			}
		}

		// Handle guest_names separately (needs JSON serialization)
		if (body.guest_names !== undefined) {
			updates.push('guest_names = ?');
			params.push(
				JSON.stringify(Array.isArray(body.guest_names) ? body.guest_names : [body.guest_names])
			);
		}

		if (updates.length === 0) {
			return json(
				{
					error: 'No fields to update'
				},
				{ status: 400 }
			);
		}

		// Add event ID at the end for WHERE clause
		params.push(id);

		const query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;

		await db.prepare(query).bind(...params).run();

		console.log(`✅ Updated event: ${id}`);

		return json({
			success: true,
			message: 'Event updated successfully'
		});
	} catch (error) {
		console.error('Error updating event:', error);
		return json(
			{
				error: 'Failed to update event',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params, platform }) => {
	try {
		// TODO: Verify JWT token

		const { id } = params;
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
		const existingEvent = await db.prepare('SELECT id FROM events WHERE id = ?').bind(id).first();

		if (!existingEvent) {
			return json(
				{
					error: 'Event not found'
				},
				{ status: 404 }
			);
		}

		// Delete event (CASCADE will also delete registrations)
		await db.prepare('DELETE FROM events WHERE id = ?').bind(id).run();

		console.log(`✅ Deleted event: ${id}`);

		return json({
			success: true,
			message: 'Event deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting event:', error);
		return json(
			{
				error: 'Failed to delete event',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

// Events API endpoints

import type { Env, Event, EventsListResponse } from '../types';
import { successResponse, errorResponse, isEventPast, createSlug, generateId } from '../utils';

/**
 * GET /api/events
 * Get list of published upcoming events
 */
export async function getEvents(request: Request, env: Env): Promise<Response> {
	try {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const status = url.searchParams.get('status') || 'published';

		// Get today's date in ISO format
		const today = new Date().toISOString().split('T')[0];

		// Query events
		const query = `
			SELECT * FROM events
			WHERE status = ?
			AND event_date >= ?
			ORDER BY event_date ASC, start_time ASC
			LIMIT ? OFFSET ?
		`;

		const { results } = await env.DB.prepare(query)
			.bind(status, today, limit, offset)
			.all<Event>();

		// Get total count
		const countQuery = `
			SELECT COUNT(*) as count FROM events
			WHERE status = ?
			AND event_date >= ?
		`;

		const countResult = await env.DB.prepare(countQuery)
			.bind(status, today)
			.first<{ count: number }>();

		const response: EventsListResponse = {
			events: results || [],
			total: countResult?.count || 0
		};

		return successResponse(response);
	} catch (error) {
		console.error('Error fetching events:', error);
		return errorResponse('Failed to fetch events', 500);
	}
}

/**
 * GET /api/events/:slug
 * Get event details by slug
 */
export async function getEventBySlug(
	request: Request,
	env: Env,
	slug: string
): Promise<Response> {
	try {
		const query = `
			SELECT * FROM events
			WHERE slug = ?
			AND status = 'published'
		`;

		const event = await env.DB.prepare(query).bind(slug).first<Event>();

		if (!event) {
			return errorResponse('Event not found', 404);
		}

		// Calculate available spots
		const availableSpots = event.max_capacity
			? event.max_capacity - event.current_registrations
			: null;

		const response = {
			...event,
			available_spots: availableSpots
		};

		return successResponse(response);
	} catch (error) {
		console.error('Error fetching event:', error);
		return errorResponse('Failed to fetch event', 500);
	}
}

/**
 * GET /api/events/archive
 * Get archived (past) events
 */
export async function getArchiveEvents(request: Request, env: Env): Promise<Response> {
	try {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Get today's date in ISO format
		const today = new Date().toISOString().split('T')[0];

		// Query past events
		const query = `
			SELECT * FROM events
			WHERE status IN ('published', 'completed')
			AND event_date < ?
			ORDER BY event_date DESC, start_time DESC
			LIMIT ? OFFSET ?
		`;

		const { results } = await env.DB.prepare(query)
			.bind(today, limit, offset)
			.all<Event>();

		// Get total count
		const countQuery = `
			SELECT COUNT(*) as count FROM events
			WHERE status IN ('published', 'completed')
			AND event_date < ?
		`;

		const countResult = await env.DB.prepare(countQuery)
			.bind(today)
			.first<{ count: number }>();

		const response: EventsListResponse = {
			events: results || [],
			total: countResult?.count || 0
		};

		return successResponse(response);
	} catch (error) {
		console.error('Error fetching archive events:', error);
		return errorResponse('Failed to fetch archive events', 500);
	}
}

/**
 * GET /api/events/:eventId/calendar
 * Generate iCalendar (.ics) file for event
 */
export async function getEventCalendar(
	request: Request,
	env: Env,
	eventId: string
): Promise<Response> {
	try {
		const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?')
			.bind(eventId)
			.first<Event>();

		if (!event) {
			return errorResponse('Event not found', 404);
		}

		// Generate .ics content
		const startDateTime = new Date(`${event.event_date}T${event.start_time}`);
		const endDateTime = new Date(startDateTime.getTime() + event.duration_minutes * 60000);

		const formatICalDate = (date: Date): string => {
			return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
		};

		const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Institut Pí//Event Management//CS
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@akce.institutpi.cz
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startDateTime)}
DTEND:${formatICalDate(endDateTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.short_description}
LOCATION:${event.venue_name ? event.venue_name + ', ' : ''}${event.venue_address}
URL:${env.SITE_URL}/akce/${event.slug}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

		return new Response(icsContent, {
			status: 200,
			headers: {
				'Content-Type': 'text/calendar; charset=utf-8',
				'Content-Disposition': `attachment; filename="${event.slug}.ics"`
			}
		});
	} catch (error) {
		console.error('Error generating calendar:', error);
		return errorResponse('Failed to generate calendar', 500);
	}
}

/*
 * ADMIN API Endpoints
 */

/**
 * GET /api/admin/events/:id
 * Get a single event by ID for the admin panel
 */
export async function getEventByIdForAdmin(request: Request, env: Env, eventId: string): Promise<Response> {
	try {
		const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first<Event>();

		if (!event) {
			return errorResponse('Event not found', 404);
		}

		return successResponse(event);
	} catch (error) {
		console.error('Error fetching event for admin:', error);
		return errorResponse('Failed to fetch event for admin', 500);
	}
}

/**
 * GET /api/admin/events
 * Get all events for the admin panel (including drafts)
 */
export async function getAllEventsForAdmin(request: Request, env: Env): Promise<Response> {
	try {
		const { results } = await env.DB.prepare(
			'SELECT id, slug, title, event_date, status, current_registrations, max_capacity FROM events ORDER BY event_date DESC'
		).all<Partial<Event>>();

		return successResponse(results || []);
	} catch (error) {
		console.error('Error fetching all events for admin:', error);
		return errorResponse('Failed to fetch events for admin', 500);
	}
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function createEvent(request: Request, env: Env): Promise<Response> {
	try {
		const body = await request.json<Partial<Event>>().catch(() => ({}));

		// Basic validation
		if (!body.title || !body.event_date || !body.start_time) {
			return errorResponse('Missing required fields: title, event_date, start_time', 400);
		}

		const id = generateId('evt');
		const slug = createSlug(body.title);

		const query = `
			INSERT INTO events (id, slug, title, short_description, long_description, program, image_url, image_alt, venue_address, venue_name, event_date, start_time, duration_minutes, guest_names, is_paid, price_czk, max_capacity, status)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			RETURNING *;
		`;

		const newEvent = await env.DB.prepare(query)
			.bind(
				id,
				slug,
				body.title,
				body.short_description || '',
				body.long_description,
				body.program,
				body.image_url,
				body.image_alt,
				body.venue_address || 'TBD',
				body.venue_name,
				body.event_date,
				body.start_time,
				body.duration_minutes || 0,
				body.guest_names,
				body.is_paid || 0,
				body.price_czk || 0,
				body.max_capacity,
				body.status || 'draft'
			)
			.first<Event>();

		return successResponse(newEvent, 'Event created successfully');
	} catch (error) {
		console.error('Error creating event:', error);
		// @ts-ignore
		if (error.message?.includes('UNIQUE constraint failed')) {
			return errorResponse('Event with this title already exists', 409);
		}
		return errorResponse('Failed to create event', 500);
	}
}

/**
 * PUT /api/admin/events/:id
 * Update an existing event
 */
export async function updateEvent(request: Request, env: Env, eventId: string): Promise<Response> {
	try {
		const body = await request.json<Partial<Event>>().catch(() => ({}));

		if (!body.title) {
			return errorResponse('Title is a required field', 400);
		}

		const slug = createSlug(body.title);

		// Dynamically build the SET part of the query
		const fieldsToUpdate = { ...body, slug, updated_at: new Date().toISOString() };
		delete fieldsToUpdate.id; // Cannot change id
		delete fieldsToUpdate.created_at; // Cannot change created_at

		const fieldNames = Object.keys(fieldsToUpdate);
		const setClause = fieldNames.map((name) => `${name} = ?`).join(', ');
		const fieldValues = Object.values(fieldsToUpdate);

		const query = `UPDATE events SET ${setClause} WHERE id = ? RETURNING *;`;

		const updatedEvent = await env.DB.prepare(query)
			.bind(...fieldValues, eventId)
			.first<Event>();

		if (!updatedEvent) {
			return errorResponse('Event not found or failed to update', 404);
		}

		return successResponse(updatedEvent, 'Event updated successfully');
	} catch (error) {
		console.error('Error updating event:', error);
		// @ts-ignore
		if (error.message?.includes('UNIQUE constraint failed')) {
			return errorResponse('Another event with this title already exists', 409);
		}
		return errorResponse('Failed to update event', 500);
	}
}

/**
 * DELETE /api/admin/events/:id
 * Delete an event
 */
export async function deleteEvent(request: Request, env: Env, eventId: string): Promise<Response> {
	try {
		const { success } = await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run();

		if (!success) {
			return errorResponse('Failed to delete event, it might not exist', 404);
		}

		return successResponse({ id: eventId }, 'Event deleted successfully');
	} catch (error) {
		console.error('Error deleting event:', error);
		return errorResponse('Failed to delete event', 500);
	}
}

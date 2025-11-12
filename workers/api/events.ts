// Events API endpoints

import type { Env, Event, EventsListResponse } from '../types';
import { successResponse, errorResponse, isEventPast } from '../utils';

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

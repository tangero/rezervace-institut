// Registrations API endpoints

import type { Env, Event, Registration, EmailJob } from '../types';
import {
	successResponse,
	errorResponse,
	generateId,
	generateToken,
	isValidEmail
} from '../utils';

/**
 * POST /api/events/:eventId/register
 * Register for an event
 */
export async function registerForEvent(
	request: Request,
	env: Env,
	eventId: string
): Promise<Response> {
	try {
		// Parse request body
		const body = await request.json().catch(() => ({}));
		const { email } = body;

		// Validate input
		if (!email || !isValidEmail(email)) {
			return errorResponse('Neplatná emailová adresa', 400);
		}

		// Get event details
		const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?')
			.bind(eventId)
			.first<Event>();

		if (!event) {
			return errorResponse('Akce nenalezena', 404);
		}

		if (event.status !== 'published') {
			return errorResponse('Akce není dostupná pro registraci', 400);
		}

		// Check if event is full
		if (event.max_capacity && event.current_registrations >= event.max_capacity) {
			return errorResponse('Akce je bohužel plně obsazena', 400);
		}

		// Check if already registered
		const existing = await env.DB.prepare(
			'SELECT * FROM registrations WHERE event_id = ? AND email = ?'
		)
			.bind(eventId, email)
			.first<Registration>();

		if (existing) {
			if (existing.is_confirmed) {
				return errorResponse('Již jste registrován/a na tuto akci', 400);
			} else {
				return errorResponse(
					'Registrace již existuje. Zkontrolujte svůj email pro potvrzení.',
					400
				);
			}
		}

		// Create registration
		const registrationId = generateId('reg');
		const confirmationToken = generateToken(32);

		const insertQuery = `
			INSERT INTO registrations (
				id, event_id, email, confirmation_token, is_confirmed, payment_status
			) VALUES (?, ?, ?, ?, 0, 'pending')
		`;

		await env.DB.prepare(insertQuery)
			.bind(registrationId, eventId, email, confirmationToken)
			.run();

		// Queue confirmation email
		const confirmationUrl = `${env.SITE_URL}/api/events/confirm/${confirmationToken}`;

		const emailJob: EmailJob = {
			type: 'confirmation',
			to: email,
			event,
			registration: {
				id: registrationId,
				event_id: eventId,
				email,
				confirmation_token: confirmationToken,
				is_confirmed: false,
				payment_status: 'pending',
				registered_at: new Date().toISOString()
			},
			confirmation_url: confirmationUrl
		};

		await env.EMAIL_QUEUE.send(emailJob);

		return successResponse(
			{ registration_id: registrationId },
			'Registrace byla vytvořena. Zkontrolujte svůj email pro potvrzení.'
		);
	} catch (error) {
		console.error('Error registering for event:', error);
		return errorResponse('Nepodařilo se vytvořit registraci', 500);
	}
}

/**
 * GET /api/events/confirm/:token
 * Confirm registration via token
 */
export async function confirmRegistration(
	request: Request,
	env: Env,
	token: string
): Promise<Response> {
	try {
		// Find registration by token
		const registration = await env.DB.prepare(
			'SELECT * FROM registrations WHERE confirmation_token = ?'
		)
			.bind(token)
			.first<Registration>();

		if (!registration) {
			// Return HTML error page
			return new Response(
				`
<!DOCTYPE html>
<html lang="cs">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Neplatný odkaz - Institut Pí</title>
	<style>
		body { font-family: Georgia, serif; text-align: center; padding: 50px; }
		h1 { color: #EF4444; }
		a { color: #2782AF; text-decoration: none; }
	</style>
</head>
<body>
	<h1>❌ Neplatný potvrzovací odkaz</h1>
	<p>Tento odkaz je neplatný nebo již byl použit.</p>
	<p><a href="${env.SITE_URL}">← Zpět na hlavní stránku</a></p>
</body>
</html>`,
				{
					status: 404,
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				}
			);
		}

		if (registration.is_confirmed) {
			// Already confirmed - redirect to success page
			return Response.redirect(`${env.SITE_URL}/potvrzeni?already=true`, 302);
		}

		// Update registration to confirmed
		await env.DB.prepare(
			'UPDATE registrations SET is_confirmed = 1, confirmed_at = CURRENT_TIMESTAMP WHERE id = ?'
		)
			.bind(registration.id)
			.run();

		// Redirect to confirmation success page
		return Response.redirect(`${env.SITE_URL}/potvrzeni?success=true`, 302);
	} catch (error) {
		console.error('Error confirming registration:', error);
		return errorResponse('Nepodařilo se potvrdit registraci', 500);
	}
}

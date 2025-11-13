// API endpoint: POST /api/register - Register for an event
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isValidEmail } from '$lib/utils';

// Generate a unique confirmation token
function generateConfirmationToken(): string {
	return `conf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Generate a unique registration ID
function generateRegistrationId(): string {
	return `reg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json();
		const { email, eventId } = body;

		// Validate input
		if (!email || !eventId) {
			return json(
				{
					error: 'Email a ID akce jsou povinné'
				},
				{ status: 400 }
			);
		}

		// Validate email format
		if (!isValidEmail(email)) {
			return json(
				{
					error: 'Neplatný formát emailu'
				},
				{ status: 400 }
			);
		}

		// Access D1 database via platform binding
		const db = platform?.env?.DB;

		if (!db) {
			// Development fallback - simulate successful registration
			console.warn('D1 database not available, simulating registration');
			const confirmationToken = generateConfirmationToken();

			// In production, this would send an email
			console.log(`Registration simulated for ${email} to event ${eventId}`);
			console.log(`Confirmation token: ${confirmationToken}`);

			return json({
				success: true,
				message: 'Registrace byla úspěšná. Zkontrolujte svůj email pro potvrzení.',
				registrationId: generateRegistrationId(),
				// In dev, return token for testing (don't do this in production!)
				debug: {
					confirmationToken,
					confirmationUrl: `/api/confirm/${confirmationToken}`
				}
			});
		}

		// Check if event exists and is published
		const event = await db
			.prepare('SELECT id, slug, max_capacity, current_registrations, status FROM events WHERE id = ?')
			.bind(eventId)
			.first();

		if (!event) {
			return json(
				{
					error: 'Akce nebyla nalezena'
				},
				{ status: 404 }
			);
		}

		if (event.status !== 'published') {
			return json(
				{
					error: 'Akce není dostupná pro registraci'
				},
				{ status: 400 }
			);
		}

		// Check if event is full
		if (event.max_capacity && event.current_registrations >= event.max_capacity) {
			return json(
				{
					error: 'Akce je již plně obsazená'
				},
				{ status: 400 }
			);
		}

		// Check if user is already registered
		const existingRegistration = await db
			.prepare('SELECT id FROM registrations WHERE event_id = ? AND email = ?')
			.bind(eventId, email)
			.first();

		if (existingRegistration) {
			return json(
				{
					error: 'Na tuto akci jste již zaregistrováni'
				},
				{ status: 400 }
			);
		}

		// Create registration
		const registrationId = generateRegistrationId();
		const confirmationToken = generateConfirmationToken();
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO registrations (id, event_id, email, confirmation_token, is_confirmed, registered_at)
				VALUES (?, ?, ?, ?, 0, ?)`
			)
			.bind(registrationId, eventId, email, confirmationToken, now)
			.run();

		// TODO: Send confirmation email using Resend API
		// For now, we'll just log it
		console.log(`Registration created: ${registrationId} for ${email} to event ${eventId}`);
		console.log(`Confirmation URL: /api/confirm/${confirmationToken}`);

		// TODO: Add to email queue
		// await platform?.env?.EMAIL_QUEUE.send({
		//   type: 'registration_confirmation',
		//   email,
		//   eventId,
		//   confirmationToken
		// });

		return json({
			success: true,
			message: 'Registrace byla úspěšná. Zkontrolujte svůj email pro potvrzení.',
			registrationId
		});
	} catch (err) {
		console.error('Error creating registration:', err);

		// Check if it's a unique constraint error
		if (err instanceof Error && err.message.includes('UNIQUE constraint')) {
			return json(
				{
					error: 'Na tuto akci jste již zaregistrováni'
				},
				{ status: 400 }
			);
		}

		return json(
			{
				error: 'Nepodařilo se vytvořit registraci'
			},
			{ status: 500 }
		);
	}
};

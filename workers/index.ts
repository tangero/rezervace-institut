// Main Cloudflare Worker entry point

import type { Env } from './types';
import { Router } from './router';
import { checkRateLimit, errorResponse, authMiddleware } from './utils';
import {
	getEvents,
	getEventBySlug,
	getArchiveEvents,
	getEventCalendar,
	getAllEventsForAdmin,
	getEventByIdForAdmin,
	createEvent,
	updateEvent,
	deleteEvent
} from './api/events';
import { registerForEvent, confirmRegistration, cancelRegistration } from './api/registrations';

// Initialize router
const router = new Router();

// --- Public API routes ---
router.get('/api/events', async (request) => {
// ... (existing code)
router.get('/api/events/confirm/:token', async (request, params) => {
	const env = (request as any).env as Env;
	return confirmRegistration(request, env, params.token);
});

router.get('/api/registrations/cancel/:token', async (request, params) => {
	const env = (request as any).env as Env;
	return cancelRegistration(request, env, params.token);
});

// --- Admin API routes (Protected) ---
const adminCreateEvent = authMiddleware(async (request) => createEvent(request, (request as any).env as Env));

const adminUpdateEvent = authMiddleware(async (request, params) => updateEvent(request, (request as any).env as Env, params.id));
const adminDeleteEvent = authMiddleware(async (request, params) => deleteEvent(request, (request as any).env as Env, params.id));
const adminGetAllEvents = authMiddleware(async (request) => getAllEventsForAdmin(request, (request as any).env as Env));
const adminGetEventById = authMiddleware(async (request, params) => getEventByIdForAdmin(request, (request as any).env as Env, params.id));

router.get('/api/admin/events', adminGetAllEvents);
router.get('/api/admin/events/:id', adminGetEventById);
router.post('/api/admin/events', adminCreateEvent);
router.put('/api/admin/events/:id', adminUpdateEvent);
router.delete('/api/admin/events/:id', adminDeleteEvent);


// --- Health check ---
router.get('/api/health', async () => {
	return new Response(
		JSON.stringify({
			status: 'ok',
			timestamp: new Date().toISOString()
		}),
		{
			headers: { 'Content-Type': 'application/json' }
		}
	);
});


// Main worker export
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Attach env to request for access in handlers
		(request as any).env = env;

		try {
			return await router.handle(request);
		} catch (error) {
			console.error('Worker error:', error);
			return errorResponse('Internal server error', 500);
		}
	},

	// Scheduled handler for cron jobs (reminders)
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log('Cron job for reminders triggered at:', new Date(event.scheduledTime).toISOString());

		const reminderPeriods = [
			{ days: 1, type: '1_day' },
			{ days: 7, type: '7_days' }
		];

		try {
			for (const period of reminderPeriods) {
				const targetDate = new Date();
				targetDate.setDate(targetDate.getDate() + period.days);
				const targetDateString = targetDate.toISOString().split('T')[0];

				// Find published events happening on the target date
				const eventsQuery = `
					SELECT * FROM events 
					WHERE event_date = ? AND status = 'published'
				`;
				const { results: events } = await env.DB.prepare(eventsQuery)
					.bind(targetDateString)
					.all<Event>();

				if (!events || events.length === 0) {
					console.log(`No events found for reminder period: ${period.days} days.`);
					continue;
				}

				for (const event of events) {
					console.log(`Processing reminders for event: ${event.title}`);

					// Find confirmed registrations for this event
					const regsQuery = `
						SELECT * FROM registrations 
						WHERE event_id = ? AND is_confirmed = 1 AND payment_status != 'cancelled'
					`;
					const { results: registrations } = await env.DB.prepare(regsQuery)
						.bind(event.id)
						.all<Registration>();
					
					if (!registrations || registrations.length === 0) {
						continue;
					}

					// Find which reminders have already been sent for these registrations
					const reminderCheckQuery = `
						SELECT registration_id FROM sent_reminders
						WHERE reminder_type = ? AND registration_id IN (${registrations.map(r => `'${r.id}'`).join(',')})
					`;
					const { results: sentReminders } = await env.DB.prepare(reminderCheckQuery)
						.bind(period.type)
						.all<{ registration_id: string }>();
					
					const sentRegIds = new Set(sentReminders?.map(sr => sr.registration_id));

					const remindersToSend: { job: EmailJob, regId: string }[] = [];

					for (const registration of registrations) {
						if (!sentRegIds.has(registration.id)) {
							// Reminder not sent, so queue it
							const emailJob: EmailJob = {
								type: 'reminder',
								to: registration.email,
								event: event,
								registration: registration
							};
							remindersToSend.push({ job: emailJob, regId: registration.id });
						}
					}

					if (remindersToSend.length > 0) {
						// Batch send to queue
						const queuePayload = remindersToSend.map(r => ({ body: r.job }));
						await env.EMAIL_QUEUE.sendBatch(queuePayload);

						// Batch insert into sent_reminders
						const sentRemindersInsertQuery = `
							INSERT INTO sent_reminders (id, registration_id, reminder_type) VALUES ${remindersToSend.map(() => '(?, ?, ?)').join(',')};
						`;
						const bindings = remindersToSend.flatMap(r => [generateId('rem'), r.regId, period.type]);
						
						await env.DB.prepare(sentRemindersInsertQuery).bind(...bindings).run();

						console.log(`Queued ${remindersToSend.length} reminders of type '${period.type}' for event ${event.id}`);
					}
				}
			}
			console.log('Reminder cron job completed successfully.');
		} catch (error) {
			console.error('Cron job error:', error);
		}
	},

	// Queue consumer for email sending
	async queue(batch: MessageBatch<EmailJob>, env: Env): Promise<void> {
		for (const message of batch.messages) {
			try {
				const job = message.body;
				console.log('Processing email job:', job.type, 'to:', job.to);

				let subject = '';
				let htmlBody = '';
				const cancellationUrl = `${env.SITE_URL}/api/registrations/cancel/${job.registration.cancellation_token}`;

				switch (job.type) {
					case 'confirmation':
						subject = `Potvrzení registrace na akci: ${job.event.title}`;
						htmlBody = `
							<h1>Děkujeme za vaši registraci!</h1>
							<p>Tímto potvrzujeme vaši registraci na akci <strong>${job.event.title}</strong>, která se koná dne ${new Date(job.event.event_date).toLocaleDateString('cs-CZ')}.</p>
							<p>Pro dokončení registrace a zajištění vašeho místa, prosím, klikněte na následující odkaz:</p>
							<p><a href="${job.confirmation_url}"><strong>Potvrdit moji účast</strong></a></p>
							<p>Pokud jste se na tuto akci neregistrovali, tento e-mail prosím ignorujte.</p>
							<hr>
							<p>S pozdravem,<br>Tým Institutu Pí</p>
						`;
						break;

					case 'reminder':
						subject = `Připomínka: Akce ${job.event.title} se blíží`;
						htmlBody = `
							<h1>Připomínka nadcházející akce</h1>
							<p>Dobrý den, jen připomínáme, že se blíží akce <strong>${job.event.title}</strong>, na kterou jste se registrovali.</p>
							<p>Koná se dne: <strong>${new Date(job.event.event_date).toLocaleDateString('cs-CZ')} v ${job.event.start_time}</strong></p>
							<p>Místo: <strong>${job.event.venue_name}, ${job.event.venue_address}</strong></p>
							<br>
							<p>Pokud víte, že se nebudete moci zúčastnit, dejte nám prosím vědět a uvolněte své místo ostatním kliknutím na odkaz níže.</p>
							<p><a href="${cancellationUrl}">Zrušit moji rezervaci</a></p>
							<br>
							<p>Těšíme se na vás!</p>
							<hr>
							<p>S pozdravem,<br>Tým Institutu Pí</p>
						`;
						break;
				}

				const resendPayload = {
					from: `Institut Pí <akce@${new URL(env.SITE_URL).hostname}>`,
					to: [job.to],
					subject: subject,
					html: htmlBody
				};
				
				const resendReq = new Request('https://api.resend.com/emails', {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${env.RESEND_API_KEY}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(resendPayload)
				});

				const resendRes = await fetch(resendReq);

				if (!resendRes.ok) {
					const errorData = await resendRes.text();
					throw new Error(`Resend API error: ${resendRes.status} ${errorData}`);
				}

				console.log('Email sent successfully to:', job.to);
				message.ack();

			} catch (error) {
				console.error('Email queue error:', error);
				message.retry({delaySeconds: 60}); // Retry after 1 minute on failure
			}
		}
	}
};

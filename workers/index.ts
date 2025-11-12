// Main Cloudflare Worker entry point

import type { Env } from './types';
import { Router } from './router';
import { checkRateLimit, errorResponse } from './utils';
import {
	getEvents,
	getEventBySlug,
	getArchiveEvents,
	getEventCalendar
} from './api/events';
import { registerForEvent, confirmRegistration } from './api/registrations';

// Initialize router
const router = new Router();

// Public API routes
router.get('/api/events', async (request) => {
	const env = (request as any).env as Env;
	return getEvents(request, env);
});

router.get('/api/events/archive', async (request) => {
	const env = (request as any).env as Env;
	return getArchiveEvents(request, env);
});

router.get('/api/events/:slug', async (request, params) => {
	const env = (request as any).env as Env;
	return getEventBySlug(request, env, params.slug);
});

router.get('/api/events/:eventId/calendar', async (request, params) => {
	const env = (request as any).env as Env;
	return getEventCalendar(request, env, params.eventId);
});

router.post('/api/events/:eventId/register', async (request, params) => {
	const env = (request as any).env as Env;

	// Rate limiting
	const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
	if (!checkRateLimit(ip, 10, 60000)) {
		return errorResponse('Příliš mnoho požadavků. Zkuste to prosím později.', 429);
	}

	return registerForEvent(request, env, params.eventId);
});

router.get('/api/events/confirm/:token', async (request, params) => {
	const env = (request as any).env as Env;
	return confirmRegistration(request, env, params.token);
});

// Health check
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
		console.log('Cron job triggered at:', new Date(event.scheduledTime).toISOString());

		try {
			// TODO: Implement reminder logic
			// 1. Query reminder_settings to get active reminders
			// 2. For each reminder, find events matching the days_before criteria
			// 3. For each event, find confirmed registrations without sent reminders
			// 4. Queue reminder emails
			// 5. Record sent reminders in sent_reminders table

			console.log('Reminder job completed');
		} catch (error) {
			console.error('Cron job error:', error);
		}
	},

	// Queue consumer for email sending
	async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
		for (const message of batch.messages) {
			try {
				// TODO: Implement email sending logic with Resend API
				const emailJob = message.body;
				console.log('Processing email job:', emailJob.type, 'to:', emailJob.to);

				// Here we would call Resend API to send the actual email
				// For now, just log it

				message.ack();
			} catch (error) {
				console.error('Email queue error:', error);
				message.retry();
			}
		}
	}
};

// Server-side hooks for SvelteKit
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// For admin API calls from server-side load functions,
	// we need to forward the auth token from cookies if available

	// In the future, we can add more middleware here
	// For now, just pass through
	const response = await resolve(event);
	return response;
};

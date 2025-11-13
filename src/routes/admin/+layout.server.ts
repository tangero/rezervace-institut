// Server-side auth check for admin pages
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	// Allow access to login page without auth
	if (url.pathname === '/admin/login') {
		return {};
	}

	// Check for auth token in cookie (we'll set this from client-side)
	// For now, we'll let the client handle this via localStorage
	// In production, use HTTP-only cookies

	// Return empty object - client will handle redirect if needed
	return {};
};

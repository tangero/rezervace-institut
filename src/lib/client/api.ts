// Client-side API utilities with authentication
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem('admin_token');
}

/**
 * Authenticated fetch - automatically adds JWT token to requests
 */
export async function authenticatedFetch(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const token = getAuthToken();

	if (!token) {
		// No token, redirect to login
		goto('/admin/login');
		throw new Error('Not authenticated');
	}

	// Add Authorization header
	const headers = {
		...options.headers,
		Authorization: `Bearer ${token}`
	};

	const response = await fetch(url, {
		...options,
		headers
	});

	// Handle 401 - token expired or invalid
	if (response.status === 401) {
		console.error('Authentication failed - redirecting to login');
		if (browser) {
			localStorage.removeItem('admin_token');
			localStorage.removeItem('admin_user');
		}
		goto('/admin/login');
		throw new Error('Authentication failed');
	}

	return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
	if (!browser) return false;
	return !!getAuthToken();
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { id: string; email: string } | null {
	if (!browser) return null;
	const userStr = localStorage.getItem('admin_user');
	if (!userStr) return null;

	try {
		return JSON.parse(userStr);
	} catch (e) {
		console.error('Failed to parse user data');
		return null;
	}
}

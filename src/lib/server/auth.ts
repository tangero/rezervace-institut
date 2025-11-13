// JWT Authentication utilities for admin panel
// Server-side only - never expose to client

import { error } from '@sveltejs/kit';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const TOKEN_EXPIRY = '24h'; // 24 hours

interface JWTPayload {
	userId: string;
	email: string;
	iat: number; // issued at
	exp: number; // expiry
}

// Simple JWT implementation (for production, use jsonwebtoken library)
function base64urlEncode(str: string): string {
	return Buffer.from(str)
		.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

function base64urlDecode(str: string): string {
	str = str.replace(/-/g, '+').replace(/_/g, '/');
	return Buffer.from(str, 'base64').toString();
}

async function hmacSign(data: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
	return base64urlEncode(Buffer.from(signature).toString('base64'));
}

/**
 * Generate JWT token for authenticated user
 */
export async function generateToken(userId: string, email: string): Promise<string> {
	const header = {
		alg: 'HS256',
		typ: 'JWT'
	};

	const now = Math.floor(Date.now() / 1000);
	const payload: JWTPayload = {
		userId,
		email,
		iat: now,
		exp: now + 24 * 60 * 60 // 24 hours from now
	};

	const encodedHeader = base64urlEncode(JSON.stringify(header));
	const encodedPayload = base64urlEncode(JSON.stringify(payload));
	const data = `${encodedHeader}.${encodedPayload}`;
	const signature = await hmacSign(data, JWT_SECRET);

	return `${data}.${signature}`;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new Error('Invalid token format');
		}

		const [encodedHeader, encodedPayload, signature] = parts;
		const data = `${encodedHeader}.${encodedPayload}`;

		// Verify signature
		const expectedSignature = await hmacSign(data, JWT_SECRET);
		if (signature !== expectedSignature) {
			throw new Error('Invalid signature');
		}

		// Decode payload
		const payload: JWTPayload = JSON.parse(base64urlDecode(encodedPayload));

		// Check expiry
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp < now) {
			throw new Error('Token expired');
		}

		return payload;
	} catch (err) {
		console.error('Token verification failed:', err);
		throw error(401, 'Invalid or expired token');
	}
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
	if (!authHeader) return null;

	// Support both "Bearer <token>" and just "<token>"
	const parts = authHeader.split(' ');
	if (parts.length === 2 && parts[0] === 'Bearer') {
		return parts[1];
	}
	if (parts.length === 1) {
		return parts[0];
	}

	return null;
}

/**
 * Verify request has valid authentication
 * Use this in admin endpoints
 */
export async function requireAuth(request: Request): Promise<JWTPayload> {
	const authHeader = request.headers.get('Authorization');
	const token = extractToken(authHeader);

	if (!token) {
		console.error('❌ No auth token provided');
		throw error(401, 'Authentication required');
	}

	try {
		const payload = await verifyToken(token);
		console.log(`✅ Authenticated as: ${payload.email}`);
		return payload;
	} catch (err) {
		console.error('❌ Authentication failed:', err);
		throw error(401, 'Invalid or expired token');
	}
}

/**
 * Simple password verification using crypto.subtle
 * In production, use bcrypt or similar
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	// For now, we'll use a simple comparison
	// TODO: Replace with bcrypt in production
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const computedHash = Buffer.from(hashBuffer).toString('hex');
	return computedHash === hash;
}

/**
 * Hash password using SHA-256
 * TODO: Replace with bcrypt in production
 */
export async function hashPassword(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	return Buffer.from(hashBuffer).toString('hex');
}

/**
 * Check if user has admin privileges
 * For now, all authenticated users are admins
 * In future, check role from database
 */
export function isAdmin(payload: JWTPayload): boolean {
	// TODO: Check role from database
	return true;
}

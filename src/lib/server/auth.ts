// JWT Authentication utilities for admin panel
// Server-side only - never expose to client

import { error } from '@sveltejs/kit';

// Note: In Cloudflare Workers, process.env is not available
// Use a hardcoded secret for now. In production, use Cloudflare secrets/env bindings
const JWT_SECRET = 'development-secret-change-in-production-use-cf-secrets';
const TOKEN_EXPIRY = '24h'; // 24 hours

interface JWTPayload {
	userId: string;
	email: string;
	iat: number; // issued at
	exp: number; // expiry
}

// Simple JWT implementation (for production, use jsonwebtoken library)
// Using Web APIs only (compatible with Cloudflare Workers)
// Note: btoa/atob are NOT available in Cloudflare Workers, so we implement our own

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let result = '';
	let i: number;

	for (i = 0; i < bytes.length; i += 3) {
		const byte1 = bytes[i];
		const byte2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
		const byte3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

		const encoded1 = byte1 >> 2;
		const encoded2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
		const encoded3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
		const encoded4 = byte3 & 0x3f;

		result += base64Chars[encoded1] + base64Chars[encoded2];
		result += i + 1 < bytes.length ? base64Chars[encoded3] : '=';
		result += i + 2 < bytes.length ? base64Chars[encoded4] : '=';
	}

	return result;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	// Remove padding
	base64 = base64.replace(/=/g, '');

	const length = base64.length;
	const bytes = new Uint8Array((length * 3) / 4);
	let byteIndex = 0;

	for (let i = 0; i < length; i += 4) {
		const encoded1 = base64Chars.indexOf(base64[i]);
		const encoded2 = base64Chars.indexOf(base64[i + 1]);
		const encoded3 = i + 2 < length ? base64Chars.indexOf(base64[i + 2]) : 0;
		const encoded4 = i + 3 < length ? base64Chars.indexOf(base64[i + 3]) : 0;

		bytes[byteIndex++] = (encoded1 << 2) | (encoded2 >> 4);
		if (i + 2 < length) bytes[byteIndex++] = ((encoded2 & 0x0f) << 4) | (encoded3 >> 2);
		if (i + 3 < length) bytes[byteIndex++] = ((encoded3 & 0x03) << 6) | encoded4;
	}

	return bytes.buffer;
}

function base64urlEncode(str: string): string {
	const encoder = new TextEncoder();
	const data = encoder.encode(str);
	return arrayBufferToBase64(data)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

function base64urlDecode(str: string): string {
	str = str.replace(/-/g, '+').replace(/_/g, '/');
	// Add padding if needed
	while (str.length % 4) {
		str += '=';
	}
	const buffer = base64ToArrayBuffer(str);
	const decoder = new TextDecoder();
	return decoder.decode(buffer);
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
	// Convert ArrayBuffer to base64url directly
	return arrayBufferToBase64(signature)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
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

	// Convert ArrayBuffer to hex string using Web APIs only
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

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

	// Convert ArrayBuffer to hex string using Web APIs only
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

// Utility functions for Institut Pí Event Management System

import type { ApiResponse } from './types';

/**
 * Generate a random ID with a prefix
 */
export function generateId(prefix: string): string {
	const timestamp = Date.now().toString(36);
	const randomStr = Math.random().toString(36).substring(2, 15);
	return `${prefix}_${timestamp}${randomStr}`;
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a slug from a title
 */
export function createSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.trim();
}

/**
 * JSON response helper
 */
export function jsonResponse<T>(
	data: ApiResponse<T>,
	status: number = 200,
	headers: Record<string, string> = {}
): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			...headers
		}
	});
}

/**
 * Success response
 */
export function successResponse<T>(data: T, message?: string): Response {
	return jsonResponse<T>(
		{
			success: true,
			data,
			message
		},
		200
	);
}

/**
 * Error response
 */
export function errorResponse(error: string, status: number = 400): Response {
	return jsonResponse(
		{
			success: false,
			error
		},
		status
	);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Parse date to ISO format
 */
export function parseDate(date: string): string {
	return new Date(date).toISOString().split('T')[0];
}

/**
 * Format date to Czech locale
 */
export function formatDateCZ(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Generate QR code data for Czech bank payment (SPD format)
 * Short Payment Descriptor according to Czech National Bank standard
 */
export function generatePaymentQRData(params: {
	account: string;
	amount: number;
	currency: string;
	variableSymbol?: string;
	message?: string;
}): string {
	const { account, amount, currency, variableSymbol, message } = params;

	// SPD format: SPD*1.0*ACC:CZ1234567890*AM:1000.00*CC:CZK*MSG:Message*X-VS:12345
	let qrData = `SPD*1.0*ACC:${account}*AM:${amount.toFixed(2)}*CC:${currency}`;

	if (variableSymbol) {
		qrData += `*X-VS:${variableSymbol}`;
	}

	if (message) {
		qrData += `*MSG:${encodeURIComponent(message)}`;
	}

	return qrData;
}

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
	const [hours, minutes] = startTime.split(':').map(Number);
	const totalMinutes = hours * 60 + minutes + durationMinutes;
	const endHours = Math.floor(totalMinutes / 60) % 24;
	const endMinutes = totalMinutes % 60;
	return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

/**
 * Check if an event date is in the past
 */
export function isEventPast(eventDate: string, startTime: string): boolean {
	const eventDateTime = new Date(`${eventDate}T${startTime}`);
	return eventDateTime < new Date();
}

/**
 * Check if an event date is within N days
 */
export function isEventWithinDays(eventDate: string, days: number): boolean {
	const event = new Date(eventDate);
	const today = new Date();
	const diffTime = event.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays <= days && diffDays >= 0;
}

/**
 * Rate limiting helper (simple in-memory store)
 * In production, use Cloudflare Durable Objects or KV
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
	const now = Date.now();
	const record = rateLimitStore.get(ip);

	if (!record || record.resetAt < now) {
		rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (record.count >= maxRequests) {
		return false;
	}

	record.count++;
	return true;
}

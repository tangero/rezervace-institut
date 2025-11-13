// Utility functions for Institut Pí Event Management System

/**
 * Format date to Czech locale
 */
export function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString('cs-CZ', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Format time (HH:MM)
 */
export function formatTime(time: string): string {
	return time;
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
 * Check if event is in the past
 */
export function isEventPast(eventDate: string, startTime: string): boolean {
	const eventDateTime = new Date(`${eventDate}T${startTime}`);
	return eventDateTime < new Date();
}

/**
 * Generate event URL
 */
export function getEventUrl(slug: string): string {
	return `/akce/${slug}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

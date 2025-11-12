// Type definitions for Institut Pí Event Management System

export interface Env {
	DB: D1Database;
	IMAGES: R2Bucket;
	EMAIL_QUEUE: Queue;
	SITE_URL: string;
	MAIN_SITE_URL: string;
	BANK_ACCOUNT: string;
	ADMIN_EMAIL: string;
	JWT_SECRET: string;
	RESEND_API_KEY: string;
}

export interface Event {
	id: string;
	slug: string;
	title: string;
	short_description: string;
	long_description?: string;
	program?: string;
	image_url?: string;
	image_alt?: string;
	venue_address: string;
	venue_name?: string;
	event_date: string;
	start_time: string;
	duration_minutes: number;
	guest_names?: string; // JSON array
	is_paid: boolean;
	price_czk: number;
	payment_qr_data?: string;
	payment_account?: string;
	payment_variable_symbol?: string;
	max_capacity?: number;
	current_registrations: number;
	status: 'draft' | 'published' | 'cancelled' | 'completed';
	created_at: string;
	updated_at: string;
}

export interface Registration {
	id: string;
	event_id: string;
	email: string;
	confirmation_token: string;
	is_confirmed: boolean;
	payment_status: 'pending' | 'paid' | 'cancelled';
	payment_confirmed_at?: string;
	registered_at: string;
	confirmed_at?: string;
}

export interface ReminderSetting {
	id: number;
	name: string;
	days_before: number;
	is_active: boolean;
}

export interface SentReminder {
	id: string;
	registration_id: string;
	reminder_type: string;
	sent_at: string;
}

export interface AdminUser {
	id: string;
	email: string;
	password_hash: string;
	name: string;
	created_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface EventsListResponse {
	events: Event[];
	total: number;
}

// Email types
export interface EmailJob {
	type: 'confirmation' | 'reminder' | 'thank-you';
	to: string;
	event: Event;
	registration?: Registration;
	confirmation_url?: string;
}

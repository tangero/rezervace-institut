// API endpoint: POST /api/admin/login - Admin authentication
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateToken, verifyPassword, hashPassword } from '$lib/server/auth';

// TODO: Move to database after initial setup
// Default admin credentials (change these!)
const DEFAULT_ADMIN = {
	email: 'admin@institutpi.cz',
	// Password: "admin123" (SHA-256 hash)
	// TODO: Replace with bcrypt and store in database
	passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
};

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const body = await request.json();
		const { email, password } = body;

		// Validate input
		if (!email || !password) {
			return json(
				{
					error: 'Email a heslo jsou povinné'
				},
				{ status: 400 }
			);
		}

		// For now, use hardcoded admin
		// TODO: Query from database
		const db = platform?.env?.DB;

		let adminUser = null;

		if (db) {
			// Try to get admin from database
			try {
				adminUser = await db
					.prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ?')
					.bind(email)
					.first();
			} catch (err) {
				console.warn('Could not query admin_users table:', err);
			}
		}

		// Fallback to default admin if not in database
		if (!adminUser) {
			console.log('📝 Using default admin credentials (not in database)');
			if (email !== DEFAULT_ADMIN.email) {
				return json(
					{
						error: 'Neplatné přihlašovací údaje'
					},
					{ status: 401 }
				);
			}
			adminUser = {
				id: 'admin_default',
				email: DEFAULT_ADMIN.email,
				password_hash: DEFAULT_ADMIN.passwordHash
			};
		}

		// Verify password
		const isValid = await verifyPassword(password, adminUser.password_hash);

		if (!isValid) {
			console.log('❌ Invalid password for:', email);
			return json(
				{
					error: 'Neplatné přihlašovací údaje'
				},
				{ status: 401 }
			);
		}

		// Generate JWT token
		const token = await generateToken(adminUser.id, adminUser.email);

		console.log(`✅ Admin logged in: ${email}`);

		return json({
			success: true,
			token,
			user: {
				id: adminUser.id,
				email: adminUser.email
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json(
			{
				error: 'Chyba při přihlašování'
			},
			{ status: 500 }
		);
	}
};

// Helper endpoint to generate password hash (development only)
// DELETE THIS IN PRODUCTION
export const GET: RequestHandler = async ({ url }) => {
	const password = url.searchParams.get('password');

	if (!password) {
		return json({ error: 'Provide ?password=yourpassword' }, { status: 400 });
	}

	const hash = await hashPassword(password);

	return json({
		password,
		hash,
		note: 'DELETE THIS ENDPOINT IN PRODUCTION!'
	});
};

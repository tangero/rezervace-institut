// API endpoint: GET /api/events - List published events
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, url }) => {
	try {
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const status = url.searchParams.get('status') || 'published';
		const archive = url.searchParams.get('archive') === 'true';

		// Access D1 database via platform binding
		const db = platform?.env?.DB;

		if (!db) {
			// Development fallback - return dummy data
			console.warn('D1 database not available, using dummy data');

			const upcomingEvents = [
				{
					id: 'evt_001',
					slug: 'debata-o-budoucnosti-eu',
					title: 'Debata o budoucnosti Evropské unie',
					short_description:
						'Připojte se k nám na diskusi o klíčových výzvách, kterým EU čelí v následujících letech.',
					event_date: '2025-12-15',
					start_time: '18:00',
					venue_name: 'Pirátské centrum Praha',
					venue_address: 'Na Moráni 360/3, Praha 2',
					image_url: 'https://placehold.co/800x450/2782AF/FFFFFF?text=EU+Debata',
					image_alt: 'Debata o EU',
					max_capacity: 50,
					current_registrations: 35
				},
				{
					id: 'evt_002',
					slug: 'workshop-digitalizace',
					title: 'Workshop: Digitalizace veřejné správy',
					short_description: 'Praktický workshop zaměřený na možnosti digitalizace veřejné správy.',
					event_date: '2025-12-20',
					start_time: '14:00',
					venue_name: 'Impact Hub Praha',
					venue_address: 'Drtinova 10, Praha 5',
					image_url: 'https://placehold.co/800x450/2782AF/FFFFFF?text=Digitalizace',
					image_alt: 'Workshop digitalizace',
					max_capacity: 30,
					current_registrations: 8
				},
				{
					id: 'evt_003',
					slug: 'klimaticka-politika-cr',
					title: 'Klimatická politika ČR v roce 2026',
					short_description:
						'Jaké jsou výzvy a příležitosti české klimatické politiky? Diskutujeme s experty.',
					event_date: '2026-01-10',
					start_time: '19:00',
					venue_name: 'Kampus Hybernská',
					venue_address: 'Hybernská 4, Praha 1',
					image_url: 'https://placehold.co/800x450/2782AF/FFFFFF?text=Klima',
					image_alt: 'Klimatická politika',
					max_capacity: 80,
					current_registrations: 42
				}
			];

			const archiveEvents = [
				{
					id: 'evt_004',
					slug: 'archiv-vzdelavani-21-stoleti',
					title: 'Vzdělávání v 21. století',
					short_description:
						'Již proběhlá akce o inovacích ve vzdělávání a přípravě mladých lidí na výzvy budoucnosti.',
					event_date: '2024-11-01',
					start_time: '16:00',
					venue_name: 'Pedagogická fakulta UK',
					venue_address: 'Školní 123, Praha 6',
					image_url: 'https://placehold.co/800x450/4B5563/FFFFFF?text=Vzd%C4%9Bl%C3%A1v%C3%A1n%C3%AD',
					image_alt: 'Vzdělávání v 21. století',
					max_capacity: 100,
					current_registrations: 85
				}
			];

			const events = archive ? archiveEvents : upcomingEvents;
			return json({
				events,
				total: events.length
			});
		}

		// Get today's date in ISO format
		const today = new Date().toISOString().split('T')[0];

		// Build query based on archive mode
		const dateCondition = archive ? 'event_date < ?' : 'event_date >= ?';
		const orderDirection = archive ? 'DESC' : 'ASC';

		// Query events from D1
		const query = `
			SELECT * FROM events
			WHERE status = ?
			AND ${dateCondition}
			ORDER BY event_date ${orderDirection}, start_time ${orderDirection}
			LIMIT ? OFFSET ?
		`;

		const { results } = await db.prepare(query).bind(status, today, limit, offset).all();

		// Get total count
		const countQuery = `
			SELECT COUNT(*) as count FROM events
			WHERE status = ?
			AND ${dateCondition}
		`;

		const countResult = await db.prepare(countQuery).bind(status, today).first();

		return json({
			events: results || [],
			total: countResult?.count || 0
		});
	} catch (error) {
		console.error('Error fetching events:', error);
		return json(
			{
				error: 'Failed to fetch events'
			},
			{ status: 500 }
		);
	}
};

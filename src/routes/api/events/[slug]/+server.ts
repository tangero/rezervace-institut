// API endpoint: GET /api/events/:slug - Get event by slug
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, params }) => {
	try {
		const { slug } = params;
		const db = platform?.env?.DB;

		if (!db) {
			// Development fallback - return dummy data
			console.warn('D1 database not available, using dummy data');

			const dummyEvents: Record<string, any> = {
				'debata-o-budoucnosti-eu': {
					id: 'evt_001',
					slug: 'debata-o-budoucnosti-eu',
					title: 'Debata o budoucnosti Evropské unie',
					short_description:
						'Připojte se k nám na diskusi o klíčových výzvách, kterým EU čelí v následujících letech. S hosty z akademické sféry a politiky.',
					long_description: `
						<p>Evropská unie čelí v následujících letech řadě výzev - od klimatické změny přes digitalizaci až po bezpečnostní hrozby. Jaké jsou možné scénáře vývoje? Co mohou členské státy udělat?</p>
						<p>Na tato a další témata budeme diskutovat s našimi hosty z akademické sféry a politiky.</p>
					`,
					program: `
						<ul>
							<li><strong>18:00 - 18:15:</strong> Úvod a představení hostů</li>
							<li><strong>18:15 - 19:00:</strong> Panelová diskuse</li>
							<li><strong>19:00 - 19:45:</strong> Otázky a odpovědi</li>
							<li><strong>19:45 - 20:00:</strong> Networking</li>
						</ul>
					`,
					event_date: '2025-12-15',
					start_time: '18:00',
					duration_minutes: 120,
					venue_name: 'Pirátské centrum Praha',
					venue_address: 'Na Moráni 360/3, Praha 2, 120 00',
					image_url: 'https://placehold.co/1200x600/2782AF/FFFFFF?text=EU+Debata',
					image_alt: 'Debata o EU',
					guest_names: '["Dr. Jan Novák", "Prof. Marie Svobodová", "Mgr. Petr Dvořák"]',
					is_paid: false,
					price_czk: 0,
					max_capacity: 50,
					current_registrations: 35,
					status: 'published'
				},
				'workshop-digitalizace': {
					id: 'evt_002',
					slug: 'workshop-digitalizace',
					title: 'Workshop: Digitalizace veřejné správy',
					short_description:
						'Praktický workshop zaměřený na možnosti digitalizace veřejné správy. Sdílení best practices a diskuse o překážkách.',
					long_description: `
						<p>Digitalizace veřejné správy je klíčová pro zvýšení efektivity a transparentnosti. V tomto workshopu se podíváme na konkrétní příklady úspěšné digitalizace a diskutujeme o překážkách implementace.</p>
						<p>Workshop je určen pro úředníky, politiky, developery a všechny, kdo se zajímají o modernizaci veřejné správy.</p>
					`,
					program: `
						<ul>
							<li><strong>14:00 - 14:30:</strong> Představení projektu Estonian e-Government</li>
							<li><strong>14:30 - 15:30:</strong> Case studies z ČR</li>
							<li><strong>15:30 - 16:00:</strong> Přestávka</li>
							<li><strong>16:00 - 17:30:</strong> Workshopové sekce</li>
							<li><strong>17:30 - 18:00:</strong> Závěrečná diskuse</li>
						</ul>
					`,
					event_date: '2025-12-20',
					start_time: '14:00',
					duration_minutes: 240,
					venue_name: 'Impact Hub Praha',
					venue_address: 'Drtinova 10, Praha 5, 150 00',
					image_url: 'https://placehold.co/1200x600/2782AF/FFFFFF?text=Digitalizace',
					image_alt: 'Workshop digitalizace',
					guest_names: '["Ing. Tomáš Krejčí, Ph.D.", "Bc. Anna Marková"]',
					is_paid: true,
					price_czk: 200,
					max_capacity: 30,
					current_registrations: 8,
					status: 'published'
				},
				'klimaticka-politika-cr': {
					id: 'evt_003',
					slug: 'klimaticka-politika-cr',
					title: 'Klimatická politika ČR v roce 2026',
					short_description:
						'Jaké jsou výzvy a příležitosti české klimatické politiky? Diskutujeme s experty o realistických cestách k uhlíkové neutralitě.',
					long_description: `
						<p>Česká republika se zavázala k dosažení uhlíkové neutrality do roku 2050. Jaké kroky je potřeba podniknout již dnes? Jaké jsou náklady a přínosy různých scénářů?</p>
						<p>V této diskusi se zaměříme na konkrétní návrhy a jejich dopady na českou ekonomiku a společnost.</p>
					`,
					program: `
						<ul>
							<li><strong>19:00 - 19:15:</strong> Úvodní slovo</li>
							<li><strong>19:15 - 20:00:</strong> Prezentace klimatických scénářů</li>
							<li><strong>20:00 - 20:45:</strong> Diskuse s hosty</li>
							<li><strong>20:45 - 21:00:</strong> Závěr a networking</li>
						</ul>
					`,
					event_date: '2026-01-10',
					start_time: '19:00',
					duration_minutes: 120,
					venue_name: 'Kampus Hybernská',
					venue_address: 'Hybernská 4, Praha 1, 110 00',
					image_url: 'https://placehold.co/1200x600/2782AF/FFFFFF?text=Klima',
					image_alt: 'Klimatická politika',
					guest_names: '["RNDr. Pavel Šťastný, CSc.", "Ing. Lucie Zemanová", "Mgr. Martin Horák"]',
					is_paid: false,
					price_czk: 0,
					max_capacity: 80,
					current_registrations: 42,
					status: 'published'
				}
			};

			const event = dummyEvents[slug];
			if (!event) {
				throw error(404, 'Event not found');
			}

			// Parse guest_names from JSON string
			const parsedEvent = {
				...event,
				guest_names: event.guest_names ? JSON.parse(event.guest_names) : []
			};

			return json(parsedEvent);
		}

		// Query event from D1
		const query = `
			SELECT * FROM events
			WHERE slug = ?
			AND status = 'published'
		`;

		const event = await db.prepare(query).bind(slug).first();

		if (!event) {
			throw error(404, 'Event not found');
		}

		// Parse guest_names from JSON string
		const parsedEvent = {
			...event,
			guest_names: event.guest_names ? JSON.parse(event.guest_names as string) : []
		};

		return json(parsedEvent);
	} catch (err) {
		console.error('Error fetching event:', err);
		if ((err as any).status === 404) {
			throw err;
		}
		return json(
			{
				error: 'Failed to fetch event'
			},
			{ status: 500 }
		);
	}
};

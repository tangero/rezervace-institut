import type { RequestHandler } from './$types';
import type { EventsListResponse, ApiResponse } from '../../../workers/types';

const siteUrl = 'https://akce.institutpi.cz';

export const GET: RequestHandler = async ({ fetch }) => {
	// Fetch all published events
	const res = await fetch(`/api/events?limit=1000`); // Assuming there are less than 1000 upcoming events
	const eventsResponse: ApiResponse<EventsListResponse> = await res.json();
	const events = eventsResponse.data.events;

	const pages = [
		'', // Homepage
		'/archiv'
	];
	for (const event of events) {
		pages.push(`/akce/${event.slug}`);
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
>
${pages
	.map(
		(page) => `
  <url>
    <loc>${siteUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`
	)
	.join('')}
</urlset>`;

	return new Response(sitemap.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': `public, max-age=${60 * 60 * 24}` // Cache for 24 hours
		}
	});
};

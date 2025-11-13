// Server-side data loading for registrations page
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	return {
		eventSlug: slug
	};
};

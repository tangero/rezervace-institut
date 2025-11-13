// Server-side data loading for event edit page
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	return {
		eventSlug: slug
	};
};

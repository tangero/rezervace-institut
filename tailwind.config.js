/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'pii-cyan': '#2782AF',
				'grey': {
					50: '#F8F9FA',
					100: '#F3F4F6',
					200: '#E5E7EB',
					600: '#4B5563',
					800: '#1F1F1F'
				}
			},
			fontFamily: {
				'bebas': ['"Bebas Neue"', 'sans-serif'],
				'serif': ['"Source Serif 4"', 'Georgia', 'serif'],
				'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif']
			}
		}
	},
	plugins: []
};

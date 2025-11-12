// Simple router for Cloudflare Workers

export type RouteHandler = (request: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
	method: string;
	pattern: RegExp;
	handler: RouteHandler;
	paramNames: string[];
}

export class Router {
	private routes: Route[] = [];

	/**
	 * Add a GET route
	 */
	get(path: string, handler: RouteHandler): void {
		this.addRoute('GET', path, handler);
	}

	/**
	 * Add a POST route
	 */
	post(path: string, handler: RouteHandler): void {
		this.addRoute('POST', path, handler);
	}

	/**
	 * Add a PUT route
	 */
	put(path: string, handler: RouteHandler): void {
		this.addRoute('PUT', path, handler);
	}

	/**
	 * Add a DELETE route
	 */
	delete(path: string, handler: RouteHandler): void {
		this.addRoute('DELETE', path, handler);
	}

	/**
	 * Add a route with any method
	 */
	private addRoute(method: string, path: string, handler: RouteHandler): void {
		const paramNames: string[] = [];
		const pattern = path.replace(/:([^/]+)/g, (_, paramName) => {
			paramNames.push(paramName);
			return '([^/]+)';
		});

		this.routes.push({
			method,
			pattern: new RegExp(`^${pattern}$`),
			handler,
			paramNames
		});
	}

	/**
	 * Handle a request
	 */
	async handle(request: Request): Promise<Response> {
		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		const url = new URL(request.url);
		const path = url.pathname;

		// Find matching route
		for (const route of this.routes) {
			if (route.method !== request.method) continue;

			const match = path.match(route.pattern);
			if (!match) continue;

			// Extract parameters
			const params: Record<string, string> = {};
			route.paramNames.forEach((name, i) => {
				params[name] = match[i + 1];
			});

			try {
				return await route.handler(request, params);
			} catch (error) {
				console.error('Route handler error:', error);
				return new Response(
					JSON.stringify({
						success: false,
						error: 'Internal server error'
					}),
					{
						status: 500,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
		}

		// No route found
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Not found'
			}),
			{
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

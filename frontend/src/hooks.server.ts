// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const url = event.url;
	if (url.pathname.startsWith('/') && !url.pathname.startsWith('/api/proxy')) {
		const targetUrl = `http://localhost:5173/api/proxy?url=https://discord.com${url.pathname}`
		const response = await fetch(targetUrl, {
			method: event.request.method,
			headers: event.request.headers,
			body:
				event.request.method !== 'GET' && event.request.method !== 'HEAD'
					? await event.request.arrayBuffer()
					: undefined,
			redirect: 'manual'
		});

		// Return proxied response back to client
		const responseHeaders = new Headers(response.headers);
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders
		});
	}
	return await resolve(event);
};

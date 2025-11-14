import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, request }) => {
	// Handle OPTIONS preflight
	if (request.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
		});
	}

	const reqUrl = new URL(request.url);
	const targetUrl = reqUrl.searchParams.get("url");

	if (!targetUrl) {
		return new Response("Missing url parameter", { status: 400 });
	}

	try {
		const response = await fetch(targetUrl);

		// Get content type of response to forward to client
		const contentType = response.headers.get("content-type") || "text/plain";

		// Get the response body as array buffer (to support binary data too)
		const body = await response.arrayBuffer();

		// Return the fetched data with CORS headers
		return new Response(body, {
			status: response.status,
			headers: {
				"Content-Type": contentType,
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, OPTIONS",
			},
		});
	} catch (error) {
		return new Response(String(error), { status: 500 });
	}
}

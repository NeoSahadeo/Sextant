/* NeoSahadeo @ Sextant */
/* Limit messages */

import { logger } from "../utils";

let limit: number = 15;
const message_limit_reg = /messages\?limit=\d+/;

export default function request_limit(ext_url: string): string | null {
	let url = ext_url;
	if (message_limit_reg.test(url)) {
		logger("Setting Limit for request" + url, "info");
		url = url.replace(message_limit_reg, `messages?limit=${limit}`);

		if (url === ext_url) return null;
		else return url;
	}
	return null;
}

export function set_request_limit(_limit: number) {
	limit = _limit;
}

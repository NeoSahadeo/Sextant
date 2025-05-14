/* NeoSahadeo @ Sextant */
/* Limit messages */

import { EventListener, logger } from "../utils";

const message_limit_reg = /(messages\?.*limit=)(\d+)/;

class RequestLimit extends EventListener {
	limit: number = 50;
	constructor() {
		super();
	}

	request_limit(ext_url: string): string | null {
		let url = ext_url;
		//[TODO]
		// ADD calculation for loading previous messages
		// Need to reverse engineer url schema

		// Message limit
		if (message_limit_reg.test(url)) {
			logger("Setting Limit for request" + url, "info");
			const q_match = url.match(message_limit_reg) as any;
			url = url.replace(message_limit_reg, `${q_match[1]}${this.limit}`);

			if (url === ext_url) return null;
			else return url;
		}
		return null;
	}

	set_request_limit(limit: number) {
		this.limit = limit;
	}
}
export const request_limit = new RequestLimit();

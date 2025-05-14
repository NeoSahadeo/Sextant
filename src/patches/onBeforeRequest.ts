import { session } from "electron";
import { logger } from "../utils";

import block_domain from "./blockDomain";
import request_limit from "./requestLimit";

export default function on_before_request() {
	session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
		const should_skip: boolean = block_domain(details.url);
		if (should_skip) {
			return callback({ cancel: true });
		}

		const redirect = request_limit(details.url);
		if (redirect) {
			logger("Redirect: " + redirect, "warning");
			return callback({ redirectURL: redirect });
		}

		callback({});
	});
}

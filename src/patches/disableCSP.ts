import { session } from "electron";

export default function disable_csp() {
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		let headers = details.responseHeaders;
		if (headers) {
			// Overwrite the CSP header
			delete headers["content-security-policy"];
			delete headers["Content-Security-Policy"];
			headers["Content-Security-Policy"] = [
				"default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
			];
		}

		callback({ responseHeaders: headers });
	});
}

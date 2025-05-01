// Patches the user agent
import { session } from "electron";

export default function user_agent_fix() {
	session.defaultSession.webRequest.onBeforeSendHeaders((details) => {
		details.requestHeaders["User-Agent"] =
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.205 Safari/537.36";
	});
}

import { session } from "electron";
import { logger } from "../utils";

export let blocked_domains = [
	"https://discord.com/api/v9/content-inventory/users/@me/spotify",
	"https://discord.com/api/v9/applications/games-supplemental",
	"https://discord.com/api/v9/applications/public",
	"https://discord.com/api/v9/users/@me/collectibles-marketing",
	"https://discord.com/api/v9/users/@me/billing/subscriptions",
	"https://discord.com/api/v9/premium-marketing",
	"https://discord.com/api/v9/science",
	"https://cdn.discordapp.com/app-icons",
	"https://api.spotify.com",
	"https://i.scdn.co/image/",
	"status.discord.com",
];

export default function block_domain() {
	session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
		const url = details.url;
		if (blocked_domains.some((domain) => url.includes(domain))) {
			logger("Blocked URL Accessed: " + url, "debug");
			return callback({ cancel: true });
		}
		// logger("Allowed URL Accessed: " + url, "info");
		callback({});
	});
}

/* NeoSahadeo @ Sextant */
/* Blocks Domains Listed Below */

import { logger } from "../utils";

let blocked_domains: (RegExp | string)[] = [
	/https:\/\/discord\.com\/api\/v9\/guilds\/\w+\/integrations/,
	"https://discord.com/api/v9/content-inventory/users/@me",
	"https://discord.com/api/v9/applications/games-supplemental",
	"https://discord.com/api/v9/applications/public",
	"https://discord.com/api/v9/users/@me/collectibles-marketing",
	"https://discord.com/api/v9/users/@me/billing/",
	"https://discord.com/api/v9/users/@me/entitlements",
	"https://discord.com/api/v9/premium-marketing",
	"https://discord.com/api/v9/science",
	"https://discord.com/api/v9/quests",
	"https://cdn.discordapp.com/app-icons",
	"https://i.scdn.co/image/",
	"status.discord.com",
];

export default function block_domain(url: string) {
	if (
		blocked_domains.some((domain) => {
			if (domain instanceof RegExp) {
				return domain.test(url);
			}
			return url.includes(domain);
		})
	) {
		logger("Blocked URL Accessed: " + url, "debug");
		return true;
	}
	return false;
	// logger("Allowed URL Accessed: " + url, "info");
}

export function set_blocked_domains(domains: string[]) {
	blocked_domains = domains;
}

/* NeoSahadeo @ Sextant */
/* Blocks Domains Listed Below */

import { logger } from "../utils";

class BlockDomain {
	blocked_domains: (RegExp | string)[] = [
		"https://discord.com/api/v9/content-inventory/users/@me",
		"https://discord.com/api/v9/applications/games-supplemental",
		"https://discord.com/api/v9/applications/public",
		"https://discord.com/api/v9/premium-marketing",
		"https://discord.com/api/v9/science",
		"https://discord.com/api/v9/quests",
		"https://i.scdn.co/image/", // Spotify Images because its loaded at full res
		"status.discord.com", // No status!
		/https:\/\/discord\.com\/api\/v9\/guilds\/\w+\/integrations/,

		// "https://discord.com/api/v9/users/@me/collectibles-marketing",
		// "https://discord.com/api/v9/users/@me/billing/",
		// "https://discord.com/api/v9/users/@me/entitlements",
	];
	constructor() { }
	block_domain(url: string) {
		if (
			this.blocked_domains.some((domain) => {
				if (domain instanceof RegExp) {
					return domain.test(url);
				}
				return url.includes(domain);
			})
		) {
			// logger("Blocked URL Accessed: " + url, "debug");
			return true;
		}
		// logger("Allowed URL Accessed: " + url, "info");
		return false;
	}

	set_blocked_domains(domains: string[]) {
		this.blocked_domains = domains;
	}
}

export const block_domain = new BlockDomain();

/* Load in a settings UI */

import path from "node:path";
import { load_file_content, logger } from "../utils";
import { ipcMain } from "electron";

export const settings_tab_handler = (s: any) => {
	ipcMain.handle("load_settings", async () => {
		const tab = await load_file_content(
			path.join("src", "components", "settingsTab.html"),
		);
		return tab;
	});
};

export const settings_tab: SextantPlugin = {
	name: "SettingsTab",
	load() {
		return () => {
			console.log("[Sextant] Loading Settings");
			let stack_found = false; // Avoid too many calls

			const observer = new MutationObserver(async (mutations) => {
				const stack = document.querySelector('[class^="stack_"]');
				if (!stack_found && stack) {
					stack_found = true;

					const script = document.createElement("script");
					script.textContent = await (window as any).electron.load_file(
						"build/components/settingsTab.js",
					);
					script.id = "sextant_settings_tab_script";

					const tab = await (window as any).electron.load_settings();

					document.body.appendChild(script);
					stack.insertAdjacentHTML(
						"afterbegin",
						`<div id="sextant_settings_tab" style="display:contents;">${tab}</div>`,
					);

					observer.disconnect();
				}
			});
			observer.observe(document.body, {
				attributes: true,
				childList: true,
				subtree: true,
			});
		};
	},
	unload() {
		return () => {
			console.log("[Sextant] Unloading Settings");
			document
				.querySelectorAll("[id*=sextant_settings_tab]")
				.forEach((e) => e.remove());
		};
	},
};

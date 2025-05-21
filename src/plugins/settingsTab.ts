/* Load in a settings UI */

import path from "node:path";
import { load_file_content, logger } from "../utils";
import { ipcMain } from "electron";

export const settings_tab_handler = (config: any) => {
	ipcMain.handle("load_settings", async () => {
		let bitrate_montior = null;

		const tab = await load_file_content(
			path.join("src", "components", "settingsTab.html"),
		);
		// if (config.Plugins.BitrateMonitor) {
		// 	bitrate_montior = await load_file_content(
		// 		path.join("src", "components", "bitrateMonitor.html"),
		// 	);
		// }
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
					// Default Settings Script
					const script = document.createElement("script");
					script.id = "sextant_settings_tab_script";
					script.textContent += await (window as any).electron.load_file(
						"build/components/settingsTab.js",
					);

					const tab = await (window as any).electron.load_settings(); // might change this to the new method

					stack.insertAdjacentHTML(
						"afterbegin",
						`<div id="sextant_settings_tab" style="display:contents;">${tab}</div>`,
					);

					// TODO - REPLACE WITH REGISTER FUNCTION
					// const p = await window.electron.load_file(
					// 	"src/components/bitrateMonitor.html",
					// );
					// console.log("Sextant", p);
					// if (bitrate_montior) {
					// 	const element = document.getElementById("bitrateMonitor");
					// 	element?.insertAdjacentHTML("afterbegin", bitrate_montior);
					// 	script.textContent += await (window as any).electron.load_file(
					// 		"build/components/bitrateMonitor.js",
					// 	);
					// }
					//
					document.body.appendChild(script);
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

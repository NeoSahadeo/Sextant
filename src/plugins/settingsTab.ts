/* Load in a settings UI */

import path from "node:path";
import { load_file_content, logger } from "../utils";
import { ipcMain } from "electron";

export const settings_tab_handler = (s: any) => {
	ipcMain.handle("load_settings", async () => {
		const button = await load_file_content(
			path.join("src", "components", "settingsButton.html"),
		);

		const tab = await load_file_content(
			path.join("src", "components", "settingsTab.html"),
		);
		return [button, tab];
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

					const [button, tab] = await (window as any).electron.load_settings();

					stack.insertAdjacentHTML(
						"beforeend",
						`<div id="sextant_settings_tab_button" style="display:contents;">${button} `,
					);
					stack.insertAdjacentHTML(
						"beforeend",
						`<div id="sextant_settings_tab" style="display:contents;">${tab} `,
					);

					const close_menu = document.getElementById(
						"sextant_settings_tab_close_button",
					);
					const open_menu = document.getElementById(
						"sextant_settings_tab_open_button",
					);

					open_menu!.addEventListener("click", () => {
						document
							.getElementById("sextant_settings_tab_menu")!
							.classList.toggle("sextant_hide");
					});
					close_menu!.addEventListener("click", () => {
						document
							.getElementById("sextant_settings_tab_menu")!
							.classList.toggle("sextant_hide");
					});

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

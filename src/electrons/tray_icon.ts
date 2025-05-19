import path from "node:path";

import { app, Menu, Tray } from "electron";
import { root_path, logger } from "../utils";
import { browser_window } from "../main";

import { override_close } from "../main";

export default function tray_icon() {
	const tray = new Tray(path.join(root_path(), "static", "tray_icon.png"));
	const context_menu = Menu.buildFromTemplate([
		{
			label: "Show",
			type: "normal",
			click: (e) => {
				browser_window.show();
			},
		},
		{
			label: "Reload",
			type: "normal",
			click: (e) => {
				browser_window.reload();
			},
		},
		{
			label: "Quit",
			type: "normal",
			click: (e) => {
				override_close.value = true;
				browser_window.close();
			},
		},
	]);

	// Make a change to the context menu
	tray.setToolTip("Sextant");

	tray.on("click", () => {
		browser_window.show();
	});

	// Call this again for Linux because we modified the context menu
	tray.setContextMenu(context_menu);
}

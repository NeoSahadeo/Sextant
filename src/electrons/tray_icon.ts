import path from "node:path";

import { app, Menu, Tray } from "electron";
import { root_path, logger } from "../utils";
import { browser_window } from "../main";

export default function tray_icon() {
	const tray = new Tray(path.join(root_path(), "static", "tray_icon.png"));
	const context_menu = Menu.buildFromTemplate([
		{
			label: "Reload",
			type: "normal",
			click: (e) => {
				browser_window.reload();
			},
		},
	]);

	// Make a change to the context menu
	tray.setToolTip("Sextant");

	// Call this again for Linux because we modified the context menu
	tray.setContextMenu(context_menu);
}

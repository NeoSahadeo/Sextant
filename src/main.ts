import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import toml from "toml";

import bootstrap from "./bootstrap";
import patch from "./patch";
import { logger, load_file_content, root_path } from "./utils";

/**Patches**/
import { auto_login_handler } from "./patches/auto_login";
import { stream_handler } from "./patches/stream";
import { dynamic_css_loader_handler } from "./patches/dynamic_css_loader";
/***********/

const pwd = dirname(fileURLToPath(import.meta.url));
const patches = [dynamic_css_loader_handler];
let settings: any; // This will be loaded from the setting.toml file in static

function create_window() {
	const browser_window = new BrowserWindow({
		width: settings.width,
		height: settings.height,
		show: settings.show_boot,
		autoHideMenuBar: settings.hide_menu_bar,
		webPreferences: {
			preload: path.join(pwd, "preload.js"),
			devTools: settings.allow_dev_tools,
		},
	});

	// Pach User Agent
	let user_agent = browser_window.webContents.getUserAgent() as string;
	user_agent = user_agent.replaceAll(/Sextant\S+|Electron\S+/g, "");

	// Load Window Contents
	browser_window.loadURL("https://www.discord.com/channels/", {
		userAgent: user_agent,
	});

	// Load Settings
	if (settings.show_dev_tools_on_boot) {
		browser_window.webContents.openDevTools();
	}
	if (!settings.allow_menu_bar) {
		browser_window.setMenu(null);
	}

	ipcMain.on("load_patches", (events: any) => {
		// Inject Java's Script
		browser_window.webContents.executeJavaScript(patch() as any);

		// Hide window till the browser_window actually loads. Might change.
		browser_window.show();
	});

	browser_window.webContents.executeJavaScript(`(${bootstrap})();`);

	// Remove these keys because!
	globalShortcut.register("Control+R", () => 0);
	globalShortcut.register("Control+Shift+R", () => 0);
}

app.whenReady().then(async () => {
	const data = await load_file_content(path.join("static", "settings.toml"));
	if (data) {
		settings = toml.parse(data);
		patches.forEach((e: Function) => e(settings));
		create_window();
	}
});

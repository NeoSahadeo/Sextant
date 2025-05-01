import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

import { app, BrowserWindow, ipcMain } from "electron";
import toml from "toml";

import bootstrap from "./bootstrap";
import patch from "./patch";
import { load_file_content } from "./utils";

/**Patches**/
import { auto_login_handler } from "./patches/auto_login";
import { stream_handler } from "./patches/stream";
/***********/

const pwd = dirname(fileURLToPath(import.meta.url));
const patches = [stream_handler];
let settings: any; // This will be loaded from the setting.toml file in static

function create_window() {
	const app = new BrowserWindow({
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
	let user_agent = app.webContents.getUserAgent() as string;
	user_agent = user_agent.replaceAll(/Sextant\S+|Electron\S+/g, "");

	// Load Window Contents
	app.loadURL("https://www.discord.com/channels/", {
		userAgent: user_agent,
	});

	// Load Settings
	if (settings.show_dev_tools_on_boot) {
		app.webContents.openDevTools();
	}
	if (!settings.show_menu_bar) {
		app.setMenu(null);
	}

	ipcMain.on("load_patches", (events: any) => {
		// Hide window till the app actually loads. Might change.
		app.show();
		// Inject Java's Script
		app.webContents.executeJavaScript(patch() as any);
	});

	app.webContents.executeJavaScript(`(${bootstrap})();`);
}

app.whenReady().then(async () => {
	const data = await load_file_content(path.join("static", "settings.toml"));
	if (data) {
		settings = toml.parse(data);
		patches.forEach((e: any) => e(settings));
		create_window();
	}
});

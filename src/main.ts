import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

import { app, BrowserWindow, ipcMain } from "electron";
import toml from "toml";

import bootstrap from "./bootstrap";
import patch from "./patch";

// Patches
import { auto_login_handler } from "./patches/auto_login";
import { stream_handler } from "./patches/stream";
//

const pwd = dirname(fileURLToPath(import.meta.url));
const patches = [stream_handler];
let settings: any;

function create_window() {
	const app = new BrowserWindow({
		width: settings.width,
		height: settings.height,
		show: settings.show_boot,
		webPreferences: {
			preload: path.join(pwd, "preload.js"),
		},
	});

	let user_agent = app.webContents.getUserAgent();
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

app.whenReady().then(() => {
	// Read in Config file
	fs.readFile(
		path.join(
			path.resolve(import.meta.dirname, ".."),
			"static",
			"settings.toml",
		),
		"utf-8",
		(err, data) => {
			if (err) {
				console.info("Something Happend When Trying to Read Settings");
				console.error(err);
				return;
			}
			settings = toml.parse(data);
			patches.forEach((e: any) => e(settings));
			create_window();
		},
	);
});

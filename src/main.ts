import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

import { app, BrowserWindow, ipcMain } from "electron";
import toml from "toml";

import bootstrap from "./bootstrap";

const pwd = dirname(fileURLToPath(import.meta.url));
let settings;

function createWindow() {
	const app = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: path.join(pwd, "preload.js"),
		},
	});

	ipcMain.on("access_files", (events: any) => { });

	// Load Window Contents
	app.loadURL("https://www.discord.com/channels/");
	app.webContents.executeJavaScript(
		`const __boostrap = ${bootstrap};__boostrap();`,
	);

	app.webContents.openDevTools();
	app.once("ready-to-show", () => {
		app.show();
	});
}

app.whenReady().then(() => {
	fs.readFile(
		path.join(
			path.resolve(import.meta.dirname, ".."),
			"static",
			"settings.toml",
		),
		"utf-8",
		(err, data) => {
			if (err) {
				console.info("Something Happend Trying to Read Config");
				console.error(err);
				return;
			}
			settings = toml.parse(data);
			console.log(settings.width);
			// createWindow();
		},
	);
});

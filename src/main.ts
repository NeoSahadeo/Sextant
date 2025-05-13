import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
	app,
	BrowserWindow,
	globalShortcut,
	ipcMain,
	session,
	desktopCapturer,
} from "electron";
import toml from "toml";

import { logger, load_file_content, root_path } from "./utils";
import { PluginManager } from "./pluginManager";

/**Plugins**/
import { dynamic_styles } from "./plugins/dynamicStyles";
import { dynamic_styles_handler } from "./plugins/dynamicStyles";
import { stop_propagration } from "./plugins/stopPropagation";
import { better_stream } from "./plugins/betterStream";
/***********/

/**Patches**/
import stream_patch from "./patches/stream";
/***********/

const pwd = dirname(fileURLToPath(import.meta.url));
let settings: any; // This will be loaded from the setting.toml file in static

const plugins = [
	dynamic_styles,
	better_stream,
	// stop_propagration
];
const plugin_handlers = [dynamic_styles_handler];

const manager = new PluginManager();

function load_plugins() {
	plugins.forEach((e) => manager.register(e));

	manager.list().forEach((e) => {
		logger(`Plugin Loaded: ${e}`, "info");
	});
}

function create_window() {
	load_plugins();

	const browser_window = new BrowserWindow({
		width: settings.width,
		height: settings.height,
		show: settings.show_boot,
		autoHideMenuBar: settings.hide_menu_bar,
		transparent: settings.transparent,
		frame: true,
		webPreferences: {
			preload: path.join(pwd, "preload.js"),
			devTools: settings.allow_dev_tools,
		},
	});

	// Only show window when plugins have loaded
	manager.addEventListener("loaded", () => {
		browser_window.show();
	});

	// Patch User Agent
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

	browser_window.webContents.on("did-finish-load", async () => {
		logger("Loading Content", "info");
		browser_window.webContents.executeJavaScript(manager.get_inject());
	});

	// Remove these keys because!
	globalShortcut.register("Control+R", () => {
		logger("Reloading", "debug");
		browser_window.webContents.executeJavaScript(manager.get_inject());
	});
	globalShortcut.register("Control+Shift+R", () => 0);
}

app.whenReady().then(async () => {
	stream_patch();

	const data = await load_file_content(path.join("static", "settings.toml"));
	if (data) {
		settings = toml.parse(data);
		plugin_handlers.forEach((e: Function) => e(settings));
		create_window();
	}
});

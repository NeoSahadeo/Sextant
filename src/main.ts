import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

import { app, BrowserWindow, globalShortcut, powerSaveBlocker } from "electron";
import toml from "toml";

import tray_icon from "./electrons/tray_icon";
import { logger, load_file_content, root_path } from "./utils";
import { PluginManager } from "./pluginManager";

/**Plugins**/
import {
	dynamic_styles,
	dynamic_styles_handler,
} from "./plugins/dynamicStyles";
import { stop_propagration } from "./plugins/stopPropagation";
import { better_stream } from "./plugins/betterStream";
import { reduce_dom_size } from "./plugins/reduceDOMSize";
import { settings_tab, settings_tab_handler } from "./plugins/settingsTab";
import { file_loader, file_loader_handler } from "./plugins/fileLoader";
import { dispatcher } from "./plugins/dispatcher";
/***********/

/**Patches**/
import disable_csp from "./patches/disableCSP";
import stream_patch from "./patches/stream";
import on_before_request from "./patches/onBeforeRequest";
/***********/

// Setters. Will change later
import { request_limit } from "./patches/requestLimit";
// import { set_blocked_domains } from "./patches/blockDomain";

const user_config_path = path.join(
	app.getPath("home"),
	".config",
	"Sextant",
	"settings.toml",
);
export const pwd = dirname(fileURLToPath(import.meta.url));
let settings: any; // This will be loaded from the setting.toml file in static

const patches = [
	stream_patch,
	on_before_request,
	//
];
const plugins = [
	dispatcher, // We them events
	file_loader, // Load asap
	settings_tab, // Load asap2
	dynamic_styles,
	better_stream,
	reduce_dom_size,
	// stop_propagration
];
const plugin_handlers = [
	file_loader_handler,
	dynamic_styles_handler,
	settings_tab_handler,
	//
];
const manager = new PluginManager();
export let browser_window: BrowserWindow;

function load_plugins() {
	plugins.forEach((e) => manager.register(e));

	manager.list().forEach((e) => {
		logger(`Plugin Loaded: ${e}`, "info");
	});
}

function create_window() {
	load_plugins();

	browser_window = new BrowserWindow({
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

	// Remove content security policy
	disable_csp();

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

	globalShortcut.register("Control+R", () => {
		logger("Reloading", "debug");
		browser_window.webContents.executeJavaScript(
			`window.sextant_events.dispatchEvent("abort", null)`,
		);
		manager.list().forEach((e) => manager.unregister(e));
		browser_window.webContents.executeJavaScript(manager.get_inject());
	});

	globalShortcut.register("Alt+F4", () => {
		browser_window.hide();
	});

	globalShortcut.register("Control+Q", () => {
		browser_window.close();
	});
	// globalShortcut.register("Control+Shift+R", () => 0);
}

async function loaded_settings() {
	return await load_file_content(path.join("static", "settings.toml"));
	if (process.env.APP_DEV) {
		return await load_file_content(path.join("static", "settings.toml"));
	} else {
		return await load_file_content(
			path.join(process.resourcesPath, "static", "settings.toml"),
		);
	}
}

app.whenReady().then(async () => {
	const id = powerSaveBlocker.start("prevent-display-sleep");
	logger("Prevent Display Sleep: " + powerSaveBlocker.isStarted(id), "info");

	patches.forEach((e) => e());

	tray_icon();

	const data = await loaded_settings();
	if (data) {
		settings = toml.parse(data);

		// Setting data. Will change later
		// set_blocked_domains(settings.blocked_domains);
		request_limit.set_request_limit(settings.request_limit);

		plugin_handlers.forEach((e: Function) => e(settings));
		create_window();
	}
});

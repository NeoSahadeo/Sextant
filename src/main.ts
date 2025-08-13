import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { app, BrowserWindow, powerSaveBlocker } from "electron";

import tray_icon from "./electrons/tray_icon";
import { logger } from "./utils";
import { auto_load, manager } from "./pluginManager";
import external_config from "./electrons/externalConfig";

/**Plugins**/
import {
	dynamic_styles,
	dynamic_styles_handler,
} from "./plugins/dynamicStyles";
import { better_stream } from "./plugins/betterStream";
import { file_loader, file_loader_handler } from "./plugins/fileLoader";
import { dispatcher } from "./plugins/dispatcher";
import { react_harder } from "./plugins/reactHarder";
/***********/

/**Patches**/
import disable_csp from "./patches/disableCSP";
import stream_patch from "./patches/stream";
import on_before_request from "./patches/onBeforeRequest";
/***********/

// Setters. Will change later
import { request_limit } from "./patches/requestLimit";
// import { set_blocked_domains } from "./patches/blockDomain";

export let override_close = { value: false }; // Controls who can close the window. Kill
export const pwd = dirname(fileURLToPath(import.meta.url));
//
// This is the newer user config file that will control everything!
export let config: any = {};

const patches = [
	stream_patch,
	on_before_request,
	//
];
let plugins = [
	dispatcher, // We them events
	file_loader, // Load asap
	react_harder,
	dynamic_styles,
	better_stream,
];
const plugin_handlers = [
	file_loader_handler,
	dynamic_styles_handler,
	//
];
export let browser_window: BrowserWindow;

async function load_plugins() {
	// Auto load plugins here. (Discovery)
	const auto_modules = await auto_load();
	plugins.push(...auto_modules);

	const desired_plugins = plugins.filter((e) =>
		config.Plugins[e.name] === undefined ? true : config.Plugins[e.name],
	);

	desired_plugins.forEach((e) => manager.register(e, config));

	manager.list().forEach((e) => {
		logger(`Plugin Loaded: ${e}`, "info");
	});
}

function create_window() {
	browser_window = new BrowserWindow({
		width: config.Settings.width,
		height: config.Settings.height,
		show: config.Settings.show_boot,
		autoHideMenuBar: config.Settings.hide_menu_bar,
		transparent: config.Settings.transparent,
		frame: true,
		webPreferences: {
			preload: path.join(pwd, "preload.js"),
			devTools: config.Settings.allow_dev_tools,
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
	if (config.Settings.show_dev_tools_on_boot) {
		browser_window.webContents.openDevTools();
	}
	if (!config.Settings.allow_menu_bar) {
		browser_window.setMenu(null);
	}

	browser_window.webContents.on("did-finish-load", async () => {
		logger("Loading Content", "info");
		browser_window.webContents.executeJavaScript(manager.get_inject());
	});

	browser_window.on("close", (event) => {
		if (override_close.value) {
			override_close.value = false;
			browser_window.close();
		} else {
			event.preventDefault(); // Prevent the default close behavior
			browser_window.hide(); // Hide the window instead
		}
	});

	browser_window.webContents.on("before-input-event", async (event, input) => {
		// re-write later
		const key = input.key.toLowerCase();
		if (input.control && key === "r") {
			event.preventDefault();

			logger("Reloading", "debug");
			browser_window.webContents.executeJavaScript(
				`window.sextant_events.dispatchEvent("abort", null)`,
			);

			// Unload and clean up
			manager.list().forEach((e) => manager.unregister(e));
			browser_window.webContents.executeJavaScript(manager.get_inject());

			// Re-register
			await load_plugins();
			browser_window.webContents.executeJavaScript(manager.get_inject());
		} else if (input.control && key === "q") {
			event.preventDefault();

			override_close.value = true;
			browser_window.close();
		}
	});

	// unregister these
	// globalShortcut.register("Control+Shift+R", () => 0);
	// globalShortcut.register("Control+R", () => 0);
	// globalShortcut.register("Control+Q", () => 0);
}

app.whenReady().then(async () => {
	const id = powerSaveBlocker.start("prevent-display-sleep");
	logger("Prevent Display Sleep: " + powerSaveBlocker.isStarted(id), "info");

	patches.forEach((e) => e());
	config = await external_config();

	await load_plugins();
	tray_icon();

	if (config) {
		// Setting data. Will change later
		// set_blocked_domains(settings.blocked_domains);
		request_limit.set_request_limit(config.Settings.request_limit);

		plugin_handlers.forEach((e: Function) => e(config));
		create_window();
	}
});

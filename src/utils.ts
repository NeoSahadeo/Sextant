import path from "node:path";
import fs from "node:fs";

class EventListener {
	listeners: any;
	constructor() {
		this.listeners = {};
	}
	/**
	 * Add an event listener to certain interactions of the function.
	 * Uses the standard JS addEventListener naming scheme and functions
	 * how you would expect it to.
	 * @param event - Event name
	 * @param callback - Callback function
	 */
	addEventListener(event: string, callback: (...args: any) => void) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		this.listeners[event].push(callback);
	}

	/**
	 * Remove an event listener from the object.
	 * Uses the standard JS removeEventListener naming scheme and functions
	 * how you would expect it to.
	 * @param event - Event name
	 * @param callback - Callback function to remove
	 */
	removeEventListener(event: string, callback: () => void) {
		if (this.listeners[event]) {
			this.listeners[event] = this.listeners[event].filter(
				(listener: () => void) => listener !== callback,
			);
		}
	}

	/**
	 * Runs all events that the object contains.
	 * Uses the standard JS dispatchEvent naming scheme and functions
	 * how you would expect it to.
	 * @param event - Event name
	 * @param data - Data for the callback
	 */
	dispatchEvent(event: string, data: any) {
		if (this.listeners[event]) {
			this.listeners[event].forEach((callback: (data: any) => void) =>
				callback(data),
			);
		}
	}
}

const root_path = () => path.resolve(import.meta.dirname, "..");

const logger = (
	message: any,
	level: "warning" | "error" | "debug" | "info" | "log" = "log",
	namespace: string = "Sextant",
) => {
	switch (level) {
		case "warning":
			console.warn(`\x1b[30;43;22m[${namespace}]\x1b[33;49m ${message}\x1b[0m`);
			break;
		case "error":
			console.error(
				`\x1b[30;41;22m[${namespace}]\x1b[31;49m ${message}\x1b[0m`,
			);
			break;
		case "debug":
			console.debug(
				`\x1b[30;45;22m[${namespace}]\x1b[35;49m ${message}\x1b[0m`,
			);
			break;
		case "info":
			console.info(`\x1b[30;22;46m[${namespace}]\x1b[36;49m ${message}\x1b[0m`);
			break;
		case "log":
			console.log(`[${namespace}] ${message}`);
			break;
	}
};

function load_file_content(file_path: string): Promise<null | string> {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(root_path(), file_path), "utf-8", (err, data) => {
			if (err) {
				logger(
					`Something happend when trying to read the file: ${file_path}`,
					"error",
				);
				reject(null);
			} else {
				resolve(data);
			}
		});
	});
}

export { load_file_content, logger, root_path, EventListener };

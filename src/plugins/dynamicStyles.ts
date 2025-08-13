/*Dynamic CSS Styling*/

import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { ipcMain } from "electron";
import {
	logger,
	relative_file_load,
	root_path,
	direct_file_load,
} from "../utils";

export const dynamic_styles_handler = (config: any) => {
	ipcMain.handle("load_css", async () => {
		let id = 0;
		let data = "";

		for (const folder of config.Settings.dynamic_css_folders) {
			const folder_path: string[] = folder.split("/");

			try {
				let files: string[];
				if (folder_path[0] == "${HOME}") {
					files = await fs.promises.readdir(
						path.join(os.homedir(), ...folder_path.slice(1)),
					);
				} else {
					files = await fs.promises.readdir(
						path.join(root_path(), ...folder_path),
					);
				}
				files = files.filter((e) => e.endsWith(".css"));

				if (folder_path[0] == "${HOME}") {
					data += (
						await Promise.all(
							files.map(async (file) => {
								const content = await direct_file_load(
									path.join(os.homedir(), ...folder_path.slice(1), file),
								);
								return `<style id="sextant_css_${id++}">${content}</style>`;
							}),
						)
					).join("");
				} else {
					data += (
						await Promise.all(
							files.map(async (file) => {
								const content = await relative_file_load(
									path.join(...folder_path, file),
								);
								return `<style id="sextant_css_${id++}">${content}</style>`;
							}),
						)
					).join("");
				}
			} catch (error) {
				logger(error, "error");
			}
		}

		return data;
	});
};

export const dynamic_styles: SextantPlugin = {
	name: "DynamicStyles",
	load() {
		return async () => {
			const data = await (window as any).electron.load_css();
			document.body.insertAdjacentHTML("afterbegin", data);
		};
	},
	unload() {
		return () => {
			const elements = document.querySelectorAll('style[id^="sextant_css_"]');
			elements.forEach((e) => e.remove());
		};
	},
};

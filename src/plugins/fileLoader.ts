import path from "path";
import { ipcMain } from "electron";
import { logger } from "../utils";
import { load_file_content } from "../utils";

export const file_loader_handler = (s: any) => {
	ipcMain.handle("load_file", async (e, file_path: string) => {
		const paths = file_path.split("/");
		return await load_file_content(path.join(...paths));
	});
};

export const file_loader: SextantPlugin = {
	name: "FileLoader",
	load() {
		return () => { };
	},
};

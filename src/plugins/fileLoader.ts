import path from "path";
import { ipcMain } from "electron";
import { logger } from "../utils";
import { relative_file_load } from "../utils";

export const file_loader_handler = (s: any) => {
	ipcMain.handle("load_file", async (e, file_path: string) => {
		const paths = file_path.split("/");
		return await relative_file_load(path.join(...paths));
	});
};

export const file_loader: SextantPlugin = {
	name: "FileLoader",
	load() {
		return () => { };
	},
};

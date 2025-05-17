import os from "os";
import { direct_file_load, logger } from "../utils";
import fs from "node:fs";
import path from "path";
import toml from "toml";
import { load_file_content } from "../utils";

const config_name = "config.toml";
const file_paths = [
	[".config", "sextant"],
	//
];

export default async function external_config() {
	let contents = null;
	for (let x = 0; x < file_paths.length; x++) {
		const p = path.join(os.homedir(), ...file_paths[x], config_name);
		if (fs.existsSync(p)) {
			logger("Found config file in: " + p, "debug");
			contents = await direct_file_load(p);
			if (contents) return toml.parse(contents);
		}
	}

	// If no file is found, use fallback
	contents = await load_file_content(path.join("static", config_name));
	if (contents) return toml.parse(contents);
}

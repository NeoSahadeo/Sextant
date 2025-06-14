import path from "node:path";
import fs from "node:fs";
import { EventListener, logger } from "./utils";
import { pwd } from "./main";

async function auto_load() {
	logger("Discovering Plugins", "info");
	const folder_path = path.join(pwd, "plugins", "auto");
	try {
		let files: string[] = await fs.promises.readdir(folder_path);
		files = files.filter((e) => e.endsWith(".js"));

		const modules: any = [];

		for (let x = 0; x < files.length; x++) {
			const module = await import(path.join(folder_path, files[x]));
			let name = null;
			let load = null;
			let unload = null;
			let handler = null;
			Object.keys(module).forEach((e) => {
				if (module[e].name) name = module[e].name;
				if (module[e].load) load = module[e].load;
				if (module[e].unload) unload = module[e].unload;
				if (module[e].handler) handler = module[e].handler;
			});
			modules.push({ name, load, unload, handler });
		}

		return modules;
	} catch (error) {
		logger(error, "error");
	}
}

class PluginManager extends EventListener {
	private plugin_inject: Record<
		string,
		Partial<{
			inject: string;
			plugin: SextantPlugin;
		}>
	> = {};

	constructor() {
		super();
	}

	register(plugin: SextantPlugin, config?: any) {
		if (plugin.handler) plugin.handler();

		this.plugin_inject[plugin.name] = {
			inject: `(${plugin.load(config)})();
							(()=>{window.${"sextant_plugin_" + plugin.name + "_config"} = ${JSON.stringify(config[plugin.name])}})();
							(()=>{window.${"sextant_plugin_" + plugin.name} = true})();`,
			plugin: plugin,
		};
	}

	unregister(name: string) {
		const plugin = this.plugin_inject[name].plugin;
		if (plugin?.unload) {
			this.plugin_inject[name] = {
				inject: `(${plugin.unload ? plugin.unload() : ""})();
				(()=>{window.${"sextant_plugin_" + plugin.name} = false})();`,
			};
		} else {
			delete this.plugin_inject[name];
		}
	}

	get_inject() {
		const out = Object.values(this.plugin_inject)
			.map((e) => e.inject)
			.join("");
		this.dispatchEvent("loaded", null);
		return out;
	}

	list(): string[] {
		return Object.values(this.plugin_inject).map((x) => x.plugin!.name);
	}
}

const manager = new PluginManager();
export { manager, auto_load };

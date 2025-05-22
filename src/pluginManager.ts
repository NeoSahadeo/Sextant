import { EventListener, logger } from "./utils";

export class PluginManager extends EventListener {
	private plugins: SextantPlugin[] = [];
	private inject: string = "";

	constructor() {
		super();
	}

	register(plugin: SextantPlugin, config?: any) {
		const injection = plugin.load(config);
		if (injection) {
			this.inject += `(${injection})();
			(()=>{window.${"sextant_plugin_" + plugin.name + "_config"} = ${JSON.stringify(config[plugin.name])}})();
			(()=>{window.${"sextant_plugin_" + plugin.name} = true})();`;
		}
		this.plugins.push(plugin);
	}

	unregister(name: string) {
		const index = this.plugins.findIndex((p) => p.name === name);
		if (index !== -1) {
			const injection = this.plugins[index].unload?.();
			if (injection) {
				this.inject += `(${injection})();`;
			}
			this.plugins.splice(index, 1);
		}
	}

	get_inject() {
		this.dispatchEvent("loaded", null);
		return this.inject;
	}

	list(): string[] {
		return this.plugins.map((x) => x.name);
	}
}

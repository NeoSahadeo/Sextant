declare global {
	interface SextantPlugin {
		name: string;
		load(config?: any): () => {} | void;
		unload?(): () => {} | void;
	}
	interface Window {
		sextant_events: SextantEventListener;
	}
}

export { };

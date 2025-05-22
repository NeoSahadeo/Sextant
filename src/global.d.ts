declare global {
	interface SextantPlugin {
		name: string;
		load(config?: any): () => {} | void;
		unload?(): () => {} | void;
	}
	interface Window {
		sextant_events: SextantEventListener;
		electron: {
			async load_file(file_path: string): Promise<string | null>;
		}
	}
}

export { };

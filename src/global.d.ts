declare global {
	interface SextantPlugin {
		name: string;
		load(config?: any): () => {} | void;
		unload?(): () => {} | void;
		handler?(config?: any): void;
	}
	interface Window {
		sextant_events: SextantEventListener;
		sextant_rtc: SextantRTCConnection;
		electron: {
			async load_file(file_path: string): Promise<string | null>;
		}
	}
}

export { };

declare global {
	interface SextantPlugin {
		name: string;
		load(): () => {} | void;
		unload?(): () => {} | void;
	}
	interface Window {
		sextant_events: SextantEventListener;
	}
}

export { };

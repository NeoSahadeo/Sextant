declare global {
	interface SextantPlugin {
		name: string;
		load(): () => {} | void;
		unload?(): void;
	}
}

export { };

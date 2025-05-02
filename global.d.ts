declare global {
	interface Window {
		logger: (
			message: any,
			level: "warning" | "error" | "debug" | "info" | "log" = "log",
			namespace: string = "Sextant",
		) => void;
		electron: {
			loaded_patch: (name, status) => void;
		};
	}
}

// This is required to make the file a module
export { };

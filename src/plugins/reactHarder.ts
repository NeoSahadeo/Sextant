// Inject react into the dom

export const react_harder: SextantPlugin = {
	name: "ReactHarder",
	load() {
		return () => {
			const script = document.createElement("script");
			script.src = "https://unpkg.com/react@18/umd/react.development.js";
			script.crossOrigin = "anonymous";
			script.id = "sextant_react_src";
			document.head.appendChild(script);
		};
	},
	unload() {
		return () => {
			document.getElementById("sextant_react_src")?.remove();
		};
	},
};

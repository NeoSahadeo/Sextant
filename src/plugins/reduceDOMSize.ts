export const reduce_dom_size: SextantPlugin = {
	name: "ReduceDOMSize",
	load() {
		return () => {
			const elements = document.querySelectorAll('[id="app-mount"]>svg'); // This causes excessive dom size issues
			elements.forEach((e) => e.remove());
		};
	},
};

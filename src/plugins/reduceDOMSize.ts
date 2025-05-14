export const reduce_dom_size: SextantPlugin = {
	name: "ReduceDOMSize",
	load() {
		return () => {
			const element = document.querySelector('[id="app-mount"]>svg');
			if (element) {
				element.remove();
			}
		};
	},
};

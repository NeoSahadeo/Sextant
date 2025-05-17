export const stop_propagation: SextantPlugin = {
	name: "StopPropagation",
	load() {
		return () => {
			const events = [
				"mousemove",
				"mouseenter",
				"mouseleave",
				"mouseover",
				"mouseout",
				"mousedown",
				"mouseup",
				"click",
				"dblclick",
				"contextmenu",
				"wheel",
			];

			events.forEach((event) => {
				document.addEventListener(
					event,
					(e) => e.stopImmediatePropagation(),
					true,
				);
			});
		};
	},
};

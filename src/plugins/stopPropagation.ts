export const stop_propagration: SextantPlugin = {
	name: "StopPropagration",
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

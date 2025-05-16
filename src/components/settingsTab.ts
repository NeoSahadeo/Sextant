function sextant_toggle_menu() {
	document
		.getElementById("sextant_settings_tab_menu")
		?.classList.toggle("sextant_hide");
}

function sextant_escape_key(e: KeyboardEvent) {
	// console.log("Sextant", e);
	if (e.key === "Escape") {
		document
			.getElementById("sextant_settings_tab_menu")
			?.classList.add("sextant_hide");
	}
}

// Menu Esc
(() => {
	const controller = new AbortController();
	const { signal } = controller;
	window.sextant_events.addEventListener("abort", () => {
		controller.abort(); // Signals Are AWESOME!
	});

	document.addEventListener("keydown", sextant_escape_key, { signal });
})();

// This is for the bitrate tracking
(() => {
	let element = document.getElementById("bitrate_display");
	if (!element) return;
	window.sextant_events.addEventListener("bitrate", (e: [number, number[]]) => {
		const [bitrate, bitrate_stack] = e;
		console.log("[Sextant] Stack: ", bitrate_stack);
		if (bitrate) element.innerText = `${bitrate.toFixed(3)}Mbps`;
	});
})();

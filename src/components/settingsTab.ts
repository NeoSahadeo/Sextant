function sextant_toggle_menu() {
	// let start_services = false;
	const element = document.getElementById("sextant_settings_tab_menu");
	if (element) {
		// start_services = !element.classList.contains("sextant_hide");
		element.classList.toggle("sextant_hide");
	}
	// if (start_services) {
	// 	try {
	// 		if (window.sextant_events.listeners["bitrate"].length > 0) {
	// 			window.sextant_events.listeners["bitrate"] = [];
	// 		}
	// 	} catch { }
	// } else {
	// 	register_stream_tracker();
	// }
}

function sextant_escape_key(e: KeyboardEvent) {
	if (e.key === "Escape") {
		document
			.getElementById("sextant_settings_tab_menu")
			?.classList.add("sextant_hide");
		// if (window.sextant_events.listeners["bitrate"].length > 0) {
		// 	window.sextant_events.listeners["bitrate"] = [];
		// }
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

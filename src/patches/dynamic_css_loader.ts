import path from "node:path";
import fs from "node:fs";
import { ipcMain } from "electron";
import { logger, load_file_content, root_path } from "../utils";

export const dynamic_css_loader_handler = (s: any) => {
	// Dynamic CSS Loader
	ipcMain.handle("load_css", async () => {
		return new Promise((resolve, reject) => {
			fs.readdir(path.join(root_path(), "static", "styles"), (err, _files) => {
				if (err) {
					logger(err, "error");
					resolve("Error loading in styles");
				} else {
					let data = "";
					_files.forEach(async (e, index) => {
						if (e.includes(".css")) {
							const content = await load_file_content(
								path.join("static", "styles", e),
							);
							data += `
						<style id="sextant_css_${index}">
						${content}
						</style>`;
						}
						if (index === _files.length - 1) resolve([data, _files.length]);
					});
				}
			});
		});
	});
};

export default () => {
	let max_retry = 10; // Prevents for runaway
	const inject_css = async () => {
		window.logger("Reloading CSS", "info");
		const data = await (window as any).electron.load_css();

		for (let x = 0; x < data[1]; x++) {
			try {
				const style_element = document.getElementById(`sextant_css_${x}`);
				if (style_element) style_element.remove();
			} catch { }
		}

		document.body.insertAdjacentHTML("afterbegin", data[0]);
	};

	// This does delete a bunch of stuff I don't
	// like and puts my button in there.
	// Might change to be optional
	const inject_button = () => {
		// const header = document.head;
		// header.insertAdjacentHTML(
		// 	"beforeend",
		// 	`<meta http-equiv="Content-Security-Policy" content="
		// 	default-src 'none';
		// 	script-src 'self';
		// 	connect-src 'self';
		// 	img-src 'self';
		// 	style-src 'self';
		// 	font-src 'self'">`,
		// );

		const stacks = document.querySelectorAll(
			"[class*='stack_'] > [class*='stack_']",
		);
		const tutors = document.querySelector('[class*="tutorialContainer__"]');

		const guild = document.querySelector('[data-list-id="guildsnav"]');
		const nav = document.querySelectorAll(
			"nav[class*='guilds_'] [class*='itemsContainer_'] [class*='stack_']",
		)[0];

		if (nav) {
			nav.innerHTML = "";
			observer.disconnect();

			// Replace the guild node with a div
			// Trying to modify it at runtime crashes discord; idk why
			const div = document.createElement("div");
			div.style = "display: flex; flex-direction: column; gap: 1em";
			div.id = "sextant_html_sidebar";
			guild?.replaceWith(div);

			div.appendChild(tutors!);
			stacks.forEach((e) => {
				div.appendChild(e);
			});

			// Create my button for dynamic css!
			const css_button = document.createElement("button");
			css_button.innerText = "RELOAD CSS";
			css_button.onclick = inject_css;
			css_button.id = "sextant_css_button";
			div.appendChild(css_button);

			window.sextant.loaded++;
		}
	};

	const observer = new MutationObserver(() => {
		inject_button();
		inject_css();
		if (--max_retry == 0) {
			window.logger(
				"Max Retries Reached, something is probably wrong",
				"error",
			);
			observer.disconnect();
		}
	});

	observer.observe(document.body!.parentNode!, {
		subtree: true,
		childList: true,
	});
};

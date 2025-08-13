import { ipcMain, shell } from "electron";
import { logger } from "../../utils";

export const external_link: SextantPlugin = {
	name: "ExternalLink",
	load(config: any) {
		return () => {
			const stopProps = (event: any) => {
				event.stopImmediatePropagation();
				event.preventDefault();
			};
			const open_link = (url: string) => {
				console.log("[Sextant] Opening Link:", url);
				(window.electron as any).open_link(url);
			};

			document.addEventListener("click", (event: any) => {
				if (
					// Handle anchor tags
					event.target.tagName === "A" &&
					event.target.href.startsWith("http") &&
					!event.target.href.startsWith("https://discord.com/")
				) {
					stopProps(event);
					open_link(event.target.href);
				} else if (
					// Handle Spans
					event.target.tagName === "SPAN"
				) {
					stopProps(event);
					open_link(event.target.innerHTML);
				}
			});
		};
	},
	unload() {
		return () => { };
	},
	handler(config: any) {
		ipcMain.on("open_link", (e, url: string) => {
			logger(url, "warning");
			shell.openExternal(url);
		});
	},
};

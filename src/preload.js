const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
	console.log("[Sextant] Hello world!");
});

contextBridge.exposeInMainWorld("electron", {
	load_patches: () => ipcRenderer.send("load_patches"),
	loaded_patch: (name, status) =>
		ipcRenderer.send("loaded_patch", name, status),

	load_css: () => ipcRenderer.invoke("load_css"),
	load_settings: () => ipcRenderer.invoke("load_settings"),
	load_file: (file_path) => ipcRenderer.invoke("load_file", file_path),
});

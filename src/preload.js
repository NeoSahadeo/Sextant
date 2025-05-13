const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	load_patches: () => ipcRenderer.send("load_patches"),
	loaded_patch: (name, status) =>
		ipcRenderer.send("loaded_patch", name, status),

	load_css: () => ipcRenderer.invoke("load_css"),
});

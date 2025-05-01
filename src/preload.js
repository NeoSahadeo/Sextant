const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	// auto_login: () => ipcRenderer.invoke("auto_login"),
	load_patches: () => ipcRenderer.send("load_patches"),
	load_css: () => ipcRenderer.invoke("load_css"),
});

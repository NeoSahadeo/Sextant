const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	readDirectory: () => ipcRenderer.send('access_files')
});

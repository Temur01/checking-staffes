const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMacAddress: () => ipcRenderer.invoke('get-mac-address')
});

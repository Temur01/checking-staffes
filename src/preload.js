const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMacAddress: () => ipcRenderer.invoke('get-mac-address'),
  
  goToFaceID: () => ipcRenderer.invoke('go-to-faceid'),
  goToWelcome: () => ipcRenderer.invoke('go-to-welcome'),
  
  verificationSuccess: () => ipcRenderer.invoke('verification-success')
});

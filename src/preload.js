const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // System info
  getMacAddress: () => ipcRenderer.invoke('get-mac-address'),
  
  // Navigation
  goToFaceID: () => ipcRenderer.invoke('go-to-faceid'),
  goToWelcome: () => ipcRenderer.invoke('go-to-welcome'),
  
  // Face ID verification
  verificationSuccess: () => ipcRenderer.invoke('verification-success')
});

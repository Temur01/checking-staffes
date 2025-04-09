const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMacAddress: () => ipcRenderer.invoke('get-mac-address'),
  checkMacExists: () => ipcRenderer.invoke('check-mac-exists'),
  
  goToFaceID: () => ipcRenderer.invoke('go-to-faceid'),
  goToWelcome: () => ipcRenderer.invoke('go-to-welcome'),
  
  verificationSuccess: () => ipcRenderer.invoke('verification-success')
});

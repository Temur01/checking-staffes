const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMacAddress: () => ipcRenderer.invoke("get-mac-address"),
  checkMacExists: () => ipcRenderer.invoke("check-mac-exists"),

  goToFaceID: () => ipcRenderer.invoke("go-to-faceid"),
  goToWelcome: () => ipcRenderer.invoke("go-to-welcome"),

  verifyFace: (imageBase64) => ipcRenderer.invoke("verify-face", imageBase64),
  verificationSuccess: () => ipcRenderer.invoke("verification-success"),
});

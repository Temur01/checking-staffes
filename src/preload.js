const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMacAddress: () => ipcRenderer.invoke("get-mac-address"),

  checkMacExists: () => ipcRenderer.invoke("check-mac-exists"),
  updateUserMac: (userPin) => ipcRenderer.invoke("update-user-mac", userPin),

  goToFaceID: () => ipcRenderer.invoke("go-to-faceid"),
  goToWelcome: () => ipcRenderer.invoke("go-to-welcome"),

  verifyFace: (imageBase64) => ipcRenderer.invoke("verify-face", imageBase64),
  verificationSuccess: () => ipcRenderer.invoke("verification-success"),

  checkTodayIsComing: () => ipcRenderer.invoke("check-today-is-coming"),
  userExit: (imageBase64) => ipcRenderer.invoke("user-exit", imageBase64),
  insertOtherUser: () => ipcRenderer.invoke("insert-other-user"),
  getUserMonitoring: () => ipcRenderer.invoke("get-user-monitoring"),

  checkAppVersion: () => ipcRenderer.invoke("check-app-version"),
});

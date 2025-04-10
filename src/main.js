const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const os = require("os");
const axios = require("axios");

let mainWindow;
let currentPage = "faceid";
const API_URL = "https://nazorat.argos.uz/api";

function getEthernetMacAddress() {
  const interfaces = os.networkInterfaces();
  const ifaceList = interfaces["Ethernet"];

  if (!ifaceList) {
    return "Ethernet interfeysi topilmadi";
  }

  for (const iface of ifaceList) {
    if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
      return iface.mac;
    }
  }

  return "Ethernet MAC topilmadi";
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      navigateOnDragDrop: false,
    },
    autoHideMenuBar: true,
    resizable: false,
    center: true,
    fullscreen: true,
    kiosk: true,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
  });

  loadPage("faceid");

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on("new-window", (event) => {
    event.preventDefault();
  });

  mainWindow.on("blur", () => {
    mainWindow.focus();
  });

  const { globalShortcut } = require("electron");

  globalShortcut.register("F11", () => {
    return false;
  });

  globalShortcut.register("Escape", () => {
    return false;
  });

  globalShortcut.register("Alt+Tab", () => {
    return false;
  });

  globalShortcut.register("Alt+F4", () => {
    return false;
  });

  globalShortcut.register("CommandOrControl+Tab", () => {
    return false;
  });

  globalShortcut.register("CommandOrControl+Shift+Tab", () => {
    return false;
  });

  mainWindow.on("closed", () => {
    globalShortcut.unregisterAll();
  });
}

function loadPage(pageName) {
  if (!mainWindow) return;

  currentPage = pageName;
  const pagePath = path.join(__dirname, `${pageName}.html`);
  mainWindow.loadFile(pagePath);
}

ipcMain.handle("get-mac-address", async () => {
  return getEthernetMacAddress();
});

ipcMain.handle("check-mac-exists", async () => {
  try {
    const macAddress = getEthernetMacAddress();
    const response = await axios.get(`${API_URL}/check-mac`, {
      params: { mac: macAddress },
    });
    return response.data.is_exists;
  } catch {
    return false;
  }
});

ipcMain.handle("update-user-mac", async (event, userPin) => {
  try {
    const macAddress = getEthernetMacAddress();
    const response = await axios.post(`${API_URL}/update-user-mac`, {
      user_pin: userPin,
      mac: macAddress,
    });
    return {
      success: response.data.success || false,
      message: response.data.message || "Unknown error",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Connection error",
    };
  }
});

ipcMain.handle("go-to-faceid", () => {
  loadPage("faceid");
  return true;
});

ipcMain.handle("go-to-welcome", () => {
  loadPage("faceid");
  return true;
});

ipcMain.handle("verify-face", async (event, imageBase64) => {
  try {
    const response = await axios.post(`${API_URL}/check-face`, {
      image: imageBase64,
      mac: getEthernetMacAddress(),
    });

    if (response.data.success_face === 1) {
      setTimeout(() => {
        app.quit();
      }, 4000);
    }

    return response.data;
  } catch {
    return { success: false, message: "Tekshirishda xatolik yuz berdi" };
  }
});

ipcMain.handle("check-today-is-coming", async () => {
  try {
    const macAddress = getEthernetMacAddress();
    const response = await axios.get(`${API_URL}/today-is-coming`, {
      params: { mac: macAddress },
    });
    return response.data;
  } catch (error) {
    console.error("Error checking today-is-coming:", error);
    return { message: "Error", data: false };
  }
});

ipcMain.handle("verification-success", () => {
  setTimeout(() => {
    loadPage("faceid");
  }, 2000);
  return true;
});

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

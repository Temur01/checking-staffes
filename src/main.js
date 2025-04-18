const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const os = require("os");
const axios = require("axios");

let mainWindow;
let currentPage = "faceid";
const API_URL = "https://nazorat.argos.uz/api";

// Add isQuitting property to app
app.isQuitting = false;

// Set the flag when quitting starts
app.on("before-quit", () => {
  app.isQuitting = true;
});

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
      contextIsolation: true, // Security best practice
      nodeIntegration: false, // Security best practice
    },
    icon: path.resolve(__dirname, "../assets/logo_project.ico"),
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

  // Prevent navigation to non-file URLs
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) {
      event.preventDefault();
    }
  });

  // Prevent new windows
  mainWindow.webContents.on("new-window", (event) => {
    event.preventDefault();
  });

  // Keep window focused
  mainWindow.on("blur", () => {
    mainWindow.focus();
  });

  // Prevent window close unless quitting
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
    }
  });

  // Register global shortcuts to block
  globalShortcut.register("Alt+F4", () => {
    console.log("Alt+F4 blocked");
    return false;
  });
  globalShortcut.register("F11", () => false);
  globalShortcut.register("Escape", () => false);
  globalShortcut.register("Alt+Tab", () => false);
  globalShortcut.register("CommandOrControl+Tab", () => false);
  globalShortcut.register("CommandOrControl+Shift+Tab", () => false);
  globalShortcut.register("CommandOrControl+Q", () => false);

  mainWindow.on("closed", () => {
    globalShortcut.unregisterAll();
  });
}

function loadPage(pageName) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  currentPage = pageName;
  const pagePath = path.join(__dirname, `${pageName}.html`);
  mainWindow.loadFile(pagePath);
}

// IPC Handlers
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
  loadPage("welcome");
  return true;
});

ipcMain.handle("verify-face", async (event, imageBase64) => {
  try {
    const response = await axios.post(`${API_URL}/check-face`, {
      image: imageBase64,
      mac: getEthernetMacAddress(),
    });

    if (response.data.success_face === 1) {
      const appIsQuitting = app.isQuitting;
      setTimeout(() => {
        if (!appIsQuitting) {
          app.quit();
        }
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
  } catch {
    return { message: "Error", data: false };
  }
});

ipcMain.handle("user-exit", async (event, imageBase64) => {
  try {
    const response = await axios.post(`${API_URL}/user-exit`, {
      image: imageBase64,
      mac: getEthernetMacAddress(),
    });

    if (response.data.success_face === 1) {
      const appIsQuitting = app.isQuitting;
      setTimeout(() => {
        if (!appIsQuitting) {
          app.quit();
        }
      }, 4000);
    }

    return response.data;
  } catch {
    return { success: false, message: "Tekshirishda xatolik yuz berdi" };
  }
});

ipcMain.handle("insert-other-user", async () => {
  try {
    const macAddress = getEthernetMacAddress();
    const response = await axios.post(`${API_URL}/insert-other-user`, {
      mac: macAddress,
    });

    if (response.data && response.data.success_face === 1) {
      app.quit();
    }

    return response.data;
  } catch {
    return {
      success: false,
      message: "Boshqa foydalanuvchi qo'shishda xatolik",
    };
  }
});

ipcMain.handle("get-user-monitoring", async () => {
  try {
    const macAddress = getEthernetMacAddress();
    const response = await axios.get(`${API_URL}/user-monitoring-info`, {
      params: { mac: macAddress },
    });
    return response.data;
  } catch {
    return {
      success: false,
      message: "Monitoring ma'lumotlarini olishda xatolik",
    };
  }
});

ipcMain.handle("verification-success", () => {
  setTimeout(() => {
    if (!app.isQuitting && mainWindow && !mainWindow.isDestroyed()) {
      loadPage("faceid");
    }
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

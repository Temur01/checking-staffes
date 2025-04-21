const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
} = require("electron");
const path = require("path");
const os = require("os");
const axios = require("axios");

let mainWindow;
const API_URL = "https://nazorat.argos.uz/api";
const APP_VERSION = "1.0-version";

app.isQuitting = false;

app.on("before-quit", () => {
  app.isQuitting = true;
});

async function checkAppVersion() {
  try {
    const response = await axios.get(`${API_URL}/check-version/${APP_VERSION}`);
    return response.data.current_version === true;
  } catch {
    return true;
  }
}

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
      contextIsolation: true,
      nodeIntegration: false,
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

  checkAppVersion().then((isCurrentVersion) => {
    if (isCurrentVersion) {
      loadPage("faceid");
    } else {
      showVersionErrorDialog();
    }
  });

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
  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
    }
  });

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

function showVersionErrorDialog() {
  const modalWindow = new BrowserWindow({
    width: 450,
    height: 200,
    parent: mainWindow,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    title: "Eski versiya",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  modalWindow.setMenu(null);

  let htmlContent = `
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: calc(100vh - 40px);
          background-color: #f5f5f5;
        }
        .message {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 16px;
        }
        .button-container {
          display: flex;
          justify-content: center;
          padding: 10px 0;
        }
        button {
          background-color: #0078d7;
          color: white;
          border: none;
          padding: 8px 30px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background-color: #00559e;
        }
      </style>
    </head>
    <body>
      <div class="message">
        Sizda eski versiya, versiyangizni yangilab olishingiz kerak, texnik bo'limga murojaat qiling!
      </div>
      <div class="button-container">
        <button id="okButton">OK</button>
      </div>
      <script>
        document.getElementById('okButton').addEventListener('click', () => {
          window.close();
        });
      </script>
    </body>
    </html>
  `;

  modalWindow.loadURL(
    "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent),
  );

  modalWindow.once("closed", () => {
    app.isQuitting = true;
    setTimeout(() => {
      app.exit(0);
    }, 100);
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

ipcMain.handle("check-app-version", async () => {
  return await checkAppVersion();
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

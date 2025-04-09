const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const axios = require('axios');

let mainWindow;
let currentPage = 'welcome';
const API_URL = 'https://nazorat.argos.uz/api';

function getEthernetMacAddress() {
  const interfaces = os.networkInterfaces();
  const ifaceList = interfaces['Ethernet']; 

  if (!ifaceList) {
    return 'Ethernet interfeysi topilmadi';
  }

  for (const iface of ifaceList) {
    if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
      return iface.mac;
    }
  }

  return 'Ethernet MAC topilmadi';
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    resizable: true,
    center: true,
    fullscreen: true
  });

  loadPage('welcome');
  
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });
  
  const { globalShortcut } = require('electron');
  
  globalShortcut.register('F11', () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  });
  
  globalShortcut.register('Escape', () => {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
  });
  
  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll();
  });
}

function loadPage(pageName) {
  if (!mainWindow) return;
  
  currentPage = pageName;
  const pagePath = path.join(__dirname, `${pageName}.html`);
  mainWindow.loadFile(pagePath);
}

ipcMain.handle('get-mac-address', async () => {
  return getEthernetMacAddress();
});

ipcMain.handle('check-mac-exists', async () => {
  try {
    const macAddress = getEthernetMacAddress();
    console.log("🚀 ~ file: main.js:81 ~ macAddress:", macAddress)
    const response = await axios.get(`${API_URL}/check-mac`, {
      params: { mac_address: macAddress }
    });
    console.log("🚀 ~ file: main.js:81 ~ response:", response.data)
    return response.data.is_exists;
  } catch {
    return false; 
  }
});

ipcMain.handle('go-to-faceid', () => {
  loadPage('faceid');
  return true;
});

ipcMain.handle('go-to-welcome', () => {
  loadPage('welcome');
  return true;
});

ipcMain.handle('verification-success', () => {
  setTimeout(() => {
    loadPage('welcome');
  }, 2000);
  return true;
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

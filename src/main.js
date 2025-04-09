const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

let mainWindow;

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
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'welcome.html'));
}

ipcMain.handle('get-mac-address', async () => {
  return getEthernetMacAddress();
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

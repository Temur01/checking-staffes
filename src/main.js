const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');

function getMacAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        return iface.mac;
      }
    }
  }
  return 'MAC address topilmadi';
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  win.loadFile(path.join(__dirname, 'welcome.html'));
}

// Renderer dan so‘rov kelsa, MAC manzilni qaytaramiz
ipcMain.handle('get-mac-address', async () => {
  return getMacAddress();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

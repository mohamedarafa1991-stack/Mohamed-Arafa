
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "MedCore Pro - Clinic Management System",
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove the default menu bar for a clean "App" look
  Menu.setApplicationMenu(null);

  // In production, load the index.html from the dist folder
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(indexPath);

  win.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

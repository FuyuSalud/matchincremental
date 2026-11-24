const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 360,
    minHeight: 560,
    backgroundColor: '#10110f',
    title: 'MATCH INCREMENTAL',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

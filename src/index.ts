export {};
const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

const paymentController = require('./main-process/controller/paymentController');
const neighborController = require('./main-process/controller/neighborController');
const DB = require('./main-process/database');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(app.getAppPath(), `/dist/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

DB.sequelize.sync();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('create-payment', async (event, ...args) => {
  const result = await paymentController.create(...args);
  return result;
});

/* Neighbors handle events */

ipcMain.handle('find-neighbor-by-dni', async (event, ...args) => {
  const result = await neighborController.findByDNI(...args);
  return result;
});
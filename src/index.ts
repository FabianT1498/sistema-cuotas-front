export {};
const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

const models = require('./main-process/database/models/index');

const bankController = require('./main-process/controllers/bankController');
const paymentController = require('./main-process/controllers/paymentController');
const neighborController = require('./main-process/controllers/neighborController');
const monthlyPaymentController = require('./main-process/controllers/monthlyPaymentController');
const repairController = require('./main-process/controllers/repairController');
const contributionController = require('./main-process/controllers/contributionController');

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/** Banks handle events */
ipcMain.handle('get-banks', async (event, ...args) => {
  const result = await bankController.getBanks();
  return result;
});

/* Payments handle events */
ipcMain.handle('create-payment', async (event, ...args) => {
  const result = await paymentController.create(...args);
  return result;
});

ipcMain.handle('get-payments-count', async (event, ...args) => {
  const result = await paymentController.getPaymentsCount();
  return result;
});

ipcMain.handle('get-payments', async (event, ...args) => {
  const result = await paymentController.getPayments(...args);
  return result;
});

ipcMain.handle('edit-payment', async (event, ...args) => {
  const result = await paymentController.edit(...args);
  return result;
});

ipcMain.handle('update-payment', async (event, ...args) => {
  const result = await paymentController.update(...args);
  return result;
});

/** Monthly Payments events */
ipcMain.handle('get-unpaid-monthly-payments', async (event, ...args) => {
  const result = await monthlyPaymentController.getUnpaidMonthlyPayments(
    ...args
  );
  return result;
});

ipcMain.handle('get-monthly-payment-cost', async (event, ...args) => {
  const result = await monthlyPaymentController.getMonthlyPaymentCost();
  return result;
});

/** Repairs handle events */
ipcMain.handle('get-unpaid-repairs', async (event, ...args) => {
  const result = await repairController.getUnpaidRepairs(...args);
  return result;
});

ipcMain.handle('create-repair', async (event, ...args) => {
  const result = await repairController.create(...args);
  return result;
});

ipcMain.handle('update-repair', async (event, ...args) => {
  const result = await repairController.update(...args);
  return result;
});

ipcMain.handle('get-repairs', async (event, ...args) => {
  const result = await repairController.getRepairs(...args);
  return result;
});

ipcMain.handle('edit-repair', async (event, ...args) => {
  const result = await repairController.edit(...args);
  return result;
});

ipcMain.handle('get-repairs-count', async (event, ...args) => {
  const result = await repairController.getRepairsCount();
  return result;
});

/** Contributions handle events */
ipcMain.handle('get-all-contributions', async (event, ...args) => {
  const result = await contributionController.getAll();
  return result;
});

/* Neighbors handle events */

ipcMain.handle('get-neighbors', async (event, ...args) => {
  const result = await neighborController.getNeighbors(...args);
  return result;
});

ipcMain.handle('get-neighbors-count', async (event, ...args) => {
  const result = await neighborController.getNeighborsCount();
  return result;
});

ipcMain.handle('find-neighbor-by-dni', async (event, ...args) => {
  const result = await neighborController.findByDNI(...args);
  return result;
});

ipcMain.handle('create-neighbor', async (event, ...args) => {
  const result = await neighborController.create(...args);
  return result;
});

ipcMain.handle('edit-neighbor', async (event, ...args) => {
  const result = await neighborController.edit(...args);
  return result;
});

ipcMain.handle('update-neighbor', async (event, ...args) => {
  const result = await neighborController.update(...args);
  return result;
});

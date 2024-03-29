/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import ChaseTagManager from './match';
// import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { TCPServer, getLocalIP } from './tcp';
// import Database from './database';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
// let db: Database;
let server: TCPServer;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

if (isDebug) {
  require('electron-debug')();
}

log.transports.file.level = 'verbose';
log.transports.console.level = 'info';
const today = new Date(Date.now()).toISOString().slice(0, -8);
if (isDebug) {
  const currentLogExist = fs.existsSync(
    path.join(RESOURCES_PATH, 'logs', 'current.log')
  );
  if (currentLogExist) {
    fs.unlinkSync(path.join(RESOURCES_PATH, 'logs', 'current.log'));
    log.info('Deleted current.log');
  }
  log.transports.file.file = path.join(RESOURCES_PATH, 'logs', 'current.log');
} else {
  log.transports.file.file = path.join(RESOURCES_PATH, 'logs', `${today}.log`);
}

log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';
log.transports.console.useStyles = true;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    title: `Nexus`,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('/'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  const match = new ChaseTagManager(mainWindow.webContents);
  server = new TCPServer(2121, mainWindow.webContents);

  getLocalIP();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
async function handleGetAssetPath(event: any, ...paths: string[]) {
  event.returnValue = path.join(RESOURCES_PATH, ...paths);
}

// ipcMain.on('database:loadData', async () => {
//   try {
//     await db.load();
//   } catch (error) {
//     console.log(error);
//   }
// });
// ipcMain.on('database:resetDB', async () => {
//   try {
//     await db.reset();
//   } catch (error) {
//     console.log(error);
//   }
// });
// ipcMain.on('database:content', async () => {
//   try {
//     await db.getContent();
//   } catch (error) {
//     console.log(error);
//   }
// });

ipcMain.handle('tcp:ip', async () => {
  try {
    return getLocalIP();
  } catch (error) {
    console.log(error);
  }
  return '';
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
    server.stop();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    ipcMain.handle('getAssetPath', handleGetAssetPath);
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

// Desktop launcher (Electron). Serves the game files through a private app:// scheme,
// so ES modules load exactly like over http and localStorage saves persist between runs.
const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = __dirname;
const START_URL = 'app://game/index.html';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function serveGameFile(request) {
  const { pathname } = new URL(request.url);
  const file = path.normalize(path.join(ROOT, decodeURIComponent(pathname)));
  // Never serve anything outside the game folder.
  if (!file.startsWith(ROOT + path.sep)) return new Response('Forbidden', { status: 403 });
  return net.fetch(pathToFileURL(file).toString());
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1460,
    height: 600,
    minWidth: 730,
    minHeight: 300,
    title: 'Dormitory: After Hours',
    backgroundColor: '#07060b',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.removeMenu();
  // The game never needs other sites: block popups and navigation away from app://.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('app://')) event.preventDefault();
  });
  win.loadURL(START_URL);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    protocol.handle('app', serveGameFile);
    createWindow();
  });
  app.on('window-all-closed', () => app.quit());
}

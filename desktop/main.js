'use strict';

const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

const GAME_URL = 'https://link-sekai-ot4mp9chy59.qoder.zone';
const ALLOWED_HOST = new URL(GAME_URL).host;

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 960,
    minHeight: 620,
    show: false,
    backgroundColor: '#07090f',
    title: 'LINK-SEKAI',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL(GAME_URL);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // 站外链接交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      if (new URL(url).host !== ALLOWED_HOST) {
        event.preventDefault();
        if (/^https?:/i.test(url)) shell.openExternal(url);
      }
    } catch (e) { /* ignore malformed urls */ }
  });

  // 断网或服务未就绪时显示本地提示页
  mainWindow.webContents.on('did-fail-load', (event, code, desc, url, isMainFrame) => {
    if (!isMainFrame) return;
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.setAppUserModelId('com.eliasneko.linksekai');

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
  try {
    dialog.showErrorBox('LINK-SEKAI', '客户端遇到一个错误：\n' + (err && err.message ? err.message : String(err)));
  } catch (e) { /* ignore */ }
});

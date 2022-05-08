import { app, BrowserWindow, clipboard, ipcMain, Menu, MenuItem, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { ElectronableModalData } from '../src/app/home/modals/electronable-modal-base/electronable-modal-base.component';
import { OutputModalData } from '../src/app/home/modals/output-modal/output-modal.component';

export interface CommandOptions {
  preventReload?: boolean;
}

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

try {
  app.on('ready', () => setTimeout(createWindow, 400));

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

  registerRunGit();
  registerContextMenu();

} catch (e) { }

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      // allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  let serveShit = () => {
    if (serve) {
      win.webContents.openDevTools();
      require('electron-reload')(__dirname, {
        electron: require(path.join(__dirname, '/../node_modules/electron'))
      });
      win.loadURL('http://localhost:4200');
    } else {
      // Path when running electron executable
      let pathIndex = './index.html';

      if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
        // Path when running electron in local folder
        pathIndex = '../dist/index.html';
      }

      win.loadURL(url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true
      }));
    }
  }

  win.webContents.on('did-fail-load', () => serveShit());
  serveShit();

  win.on('closed', () => {
    win = null;
  });

  return win;
}

function registerRunGit() {
  ipcMain.handle("run-git", (event, path: string, command: string) => {
    const { exec } = require("child_process");

    return new Promise((resolve, reject) => {
      exec(`git ${command}`, { cwd: path }, (error: any, stdout: any, stderr: any) => {
        return resolve({ stdout: stdout, stderr: stderr });
      });
    });
  });

  ipcMain.on("run-cmd", (event, command: string, path: string, options?: CommandOptions) => {
    runCmd(command, path, options);
  });
}

function runCmd(command: string, path: string, options: CommandOptions) {
  const { exec } = require("child_process");
  exec(command, { cwd: path }, (error: any, stdout: any, stderr: any) => {
    const result: OutputModalData = {
      preventReload: options?.preventReload,
      stdout: stdout,
      stderr: stderr,
      error: error,
      repoPath: path,
      componentName: 'OutputModalComponent'
    };
    win.webContents.send('open-output-modal', result);
  });
}

function registerContextMenu() {
  var menu = new Menu();

  ipcMain.on("set-context-menu-command-items", (event, items: ContextMenuItem[]) => {
    menu = new Menu();

    items.forEach(x => menu.append(makeMenuItem(x)));
  });

  app.on("web-contents-created", (event, webContents) => {
    webContents.on("context-menu", (event, click) => {
      event.preventDefault();
      menu.popup(<any>webContents);
      menu = new Menu();
    });
  });
}

function makeMenuItem(x: ContextMenuItem): MenuItem {
  let submenu = x.nested?.length > 0 ? new Menu() : null;
  x.nested.forEach(y => submenu.append(makeMenuItem(y)));

  return new MenuItem({
    label: x.label,
    click: makeClick(x),
    submenu: submenu,
  })
}

export interface ContextMenuItem {
  label: string;
  action: 'open-modal' | 'run-cmd' | 'group' | 'copy' | 'show-in-folder';
  actionContent: string;
  path?: string;
  modalData?: ElectronableModalData;
  nested: ContextMenuItem[];
  commandOptions?: CommandOptions;
}

function makeClick(x: ContextMenuItem): (menuItem: Electron.MenuItem, browserWindow: Electron.BrowserWindow, event: Electron.KeyboardEvent) => void {
  switch (x.action) {
    case 'open-modal':
      return function () {
        win.webContents.send('open-modal', x.modalData);
      }
    case 'run-cmd':
      return function () {
        runCmd(x.actionContent, x.path, x.commandOptions);
      }
    case 'show-in-folder':
      return function () {
        const { shell } = require('electron');
        shell.showItemInFolder(x.path + '/' + x.actionContent);
      }
    case 'copy':
      return function () {
        clipboard.writeText(x.actionContent);
      }
    default:
      return null;
  }
}
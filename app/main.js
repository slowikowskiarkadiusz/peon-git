"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var url = require("url");
var win = null;
var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
try {
    electron_1.app.on('ready', function () { return setTimeout(createWindow, 400); });
    electron_1.app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        if (win === null) {
            createWindow();
        }
    });
    registerRunGit();
    registerContextMenu();
}
catch (e) { }
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            // allowRunningInsecureContent: (serve) ? true : false,
            contextIsolation: false, // false if you want to run e2e test with Spectron
        },
    });
    var serveShit = function () {
        if (serve) {
            win.webContents.openDevTools();
            require('electron-reload')(__dirname, {
                electron: require(path.join(__dirname, '/../node_modules/electron'))
            });
            win.loadURL('http://localhost:4200');
        }
        else {
            // Path when running electron executable
            var pathIndex = './index.html';
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
    };
    win.webContents.on('did-fail-load', function () { return serveShit(); });
    serveShit();
    win.on('closed', function () {
        win = null;
    });
    return win;
}
function registerRunGit() {
    electron_1.ipcMain.handle("run-git", function (event, path, command) {
        var exec = require("child_process").exec;
        return new Promise(function (resolve, reject) {
            exec("git ".concat(command), { cwd: path }, function (error, stdout, stderr) {
                return resolve({ stdout: stdout, stderr: stderr });
            });
        });
    });
    electron_1.ipcMain.on("run-cmd", function (event, command, path, options) {
        runCmd(command, path, options);
    });
}
function runCmd(command, path, options) {
    var exec = require("child_process").exec;
    exec(command, { cwd: path }, function (error, stdout, stderr) {
        var result = {
            preventReload: options === null || options === void 0 ? void 0 : options.preventReload,
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
    var menu = new electron_1.Menu();
    electron_1.ipcMain.on("set-context-menu-command-items", function (event, items) {
        menu = new electron_1.Menu();
        items.forEach(function (x) { return menu.append(makeMenuItem(x)); });
    });
    electron_1.app.on("web-contents-created", function (event, webContents) {
        webContents.on("context-menu", function (event, click) {
            event.preventDefault();
            menu.popup(webContents);
            menu = new electron_1.Menu();
        });
    });
}
function makeMenuItem(x) {
    var _a;
    var submenu = ((_a = x.nested) === null || _a === void 0 ? void 0 : _a.length) > 0 ? new electron_1.Menu() : null;
    x.nested.forEach(function (y) { return submenu.append(makeMenuItem(y)); });
    return new electron_1.MenuItem({
        label: x.label,
        click: makeClick(x),
        submenu: submenu,
    });
}
function makeClick(x) {
    switch (x.action) {
        case 'open-modal':
            return function () {
                win.webContents.send('open-modal', x.modalData);
            };
        case 'run-cmd':
            return function () {
                runCmd(x.actionContent, x.path, x.commandOptions);
            };
        case 'show-in-folder':
            return function () {
                var shell = require('electron').shell;
                shell.showItemInFolder(x.path + '/' + x.actionContent);
            };
        case 'copy':
            return function () {
                electron_1.clipboard.writeText(x.actionContent);
            };
        default:
            return null;
    }
}
//# sourceMappingURL=main.js.map
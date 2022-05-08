"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronService = void 0;
var core_1 = require("@angular/core");
var ElectronService = /** @class */ (function () {
    function ElectronService() {
        var _a;
        this.openModal = new core_1.EventEmitter();
        this.openOutputModal = new core_1.EventEmitter();
        if (!!((_a = window === null || window === void 0 ? void 0 : window.process) === null || _a === void 0 ? void 0 : _a.type)) { // isElectron
            this.ipcRenderer = window.require('electron').ipcRenderer;
            this.webFrame = window.require('electron').webFrame;
            this.childProcess = window.require('child_process');
            this.fs = window.require('fs');
        }
    }
    ElectronService.prototype.registerOpeningModal = function () {
        var _this = this;
        this.ipcRenderer.on('open-modal', function (event, modalData) {
            _this.openModal.emit(modalData);
        });
        return this.openModal;
    };
    ElectronService.prototype.registerOpeningOutputModal = function () {
        var _this = this;
        this.ipcRenderer.on('open-output-modal', function (event, outputData) {
            _this.openOutputModal.emit(outputData);
        });
        return this.openOutputModal;
    };
    ElectronService.prototype.setModal = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return _this.ipcRenderer.on('modal-data-out', function (event, res) { return resolve(JSON.parse(res)); }); });
    };
    ElectronService.prototype.setContextMenuCommands = function (items) {
        var _this = this;
        items.forEach(function (x) { return _this.ipcRenderer.send('set-context-menu-command-items', items); });
    };
    ElectronService.prototype.runCmd = function (command, path, options) {
        this.ipcRenderer.send('run-cmd', command, path, options);
    };
    ElectronService = __decorate([
        (0, core_1.Injectable)({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], ElectronService);
    return ElectronService;
}());
exports.ElectronService = ElectronService;
//# sourceMappingURL=electron.service.js.map
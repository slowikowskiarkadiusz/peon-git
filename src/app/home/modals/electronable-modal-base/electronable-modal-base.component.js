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
exports.ElectronableModalBaseComponent = void 0;
var core_1 = require("@angular/core");
var dialog_1 = require("@angular/material/dialog");
var services_1 = require("../../../core/services");
var ElectronableModalBaseComponent = /** @class */ (function () {
    function ElectronableModalBaseComponent(electronService, electronDialogRef) {
        this.electronService = electronService;
        this.electronDialogRef = electronDialogRef;
        this.btnsToRender = ['help', 'cancel', 'submit'];
        this.helpDisabled = false;
        this.cancelDisabled = false;
        this.submitDisabled = false;
        this.autoCloseOnCancel = true;
        this.autoCloseOnSubmit = true;
        this.help = new core_1.EventEmitter();
        this.cancel = new core_1.EventEmitter();
        this.submit = new core_1.EventEmitter();
    }
    ElectronableModalBaseComponent.prototype.keyEvent = function (event) {
        if (Object.getPrototypeOf(this).constructor.name !== 'ElectronableModalBaseComponent')
            return;
        if (event.key.toLowerCase() == 'enter')
            this._onSubmit();
        else if (event.key.toLowerCase() == 'escape')
            this._onCancel();
    };
    Object.defineProperty(ElectronableModalBaseComponent.prototype, "doRenderHelp", {
        get: function () {
            return this.btnsToRender.includes('help');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElectronableModalBaseComponent.prototype, "doRenderCancel", {
        get: function () {
            return this.btnsToRender.includes('cancel');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElectronableModalBaseComponent.prototype, "doRenderSubmit", {
        get: function () {
            return this.btnsToRender.includes('submit');
        },
        enumerable: false,
        configurable: true
    });
    ElectronableModalBaseComponent.prototype._onSubmit = function () {
        this.submit.emit();
        if (this.autoCloseOnSubmit) {
            this.electronDialogRef.close();
        }
    };
    ElectronableModalBaseComponent.prototype._onCancel = function () {
        this.cancel.emit();
        if (this.autoCloseOnCancel) {
            this.electronDialogRef.close();
        }
    };
    ElectronableModalBaseComponent.prototype.nothing = function () { };
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Array)
    ], ElectronableModalBaseComponent.prototype, "btnsToRender", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], ElectronableModalBaseComponent.prototype, "helpDisabled", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], ElectronableModalBaseComponent.prototype, "cancelDisabled", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], ElectronableModalBaseComponent.prototype, "submitDisabled", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], ElectronableModalBaseComponent.prototype, "autoCloseOnCancel", void 0);
    __decorate([
        (0, core_1.Input)(),
        __metadata("design:type", Boolean)
    ], ElectronableModalBaseComponent.prototype, "autoCloseOnSubmit", void 0);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], ElectronableModalBaseComponent.prototype, "help", void 0);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], ElectronableModalBaseComponent.prototype, "cancel", void 0);
    __decorate([
        (0, core_1.Output)(),
        __metadata("design:type", core_1.EventEmitter)
    ], ElectronableModalBaseComponent.prototype, "submit", void 0);
    __decorate([
        (0, core_1.HostListener)('window:keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [KeyboardEvent]),
        __metadata("design:returntype", void 0)
    ], ElectronableModalBaseComponent.prototype, "keyEvent", null);
    ElectronableModalBaseComponent = __decorate([
        (0, core_1.Component)({
            selector: 'app-electronable-modal-base',
            templateUrl: './electronable-modal-base.component.html',
            styleUrls: ['./electronable-modal-base.component.scss']
        }),
        __metadata("design:paramtypes", [services_1.ElectronService,
            dialog_1.MatDialogRef])
    ], ElectronableModalBaseComponent);
    return ElectronableModalBaseComponent;
}());
exports.ElectronableModalBaseComponent = ElectronableModalBaseComponent;
//# sourceMappingURL=electronable-modal-base.component.js.map
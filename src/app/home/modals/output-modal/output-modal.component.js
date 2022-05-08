"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputModalComponent = void 0;
var core_1 = require("@angular/core");
var dialog_1 = require("@angular/material/dialog");
var platform_browser_1 = require("@angular/platform-browser");
var services_1 = require("../../../core/services");
var git_service_1 = require("../../../core/services/electron/git.service");
var electronable_modal_base_component_1 = require("../electronable-modal-base/electronable-modal-base.component");
var OutputModalComponent = /** @class */ (function (_super) {
    __extends(OutputModalComponent, _super);
    function OutputModalComponent(data, electronService, gitService, title, dialogRef) {
        var _this = _super.call(this, electronService, dialogRef) || this;
        _this.data = data;
        _this.electronService = electronService;
        _this.gitService = gitService;
        _this.title = title;
        _this.dialogRef = dialogRef;
        _this.stdout = null;
        _this.stderr = null;
        _this.stdoutColor = '#0066ff';
        _this.stderrColor = '#cc0000';
        _this.title.setTitle("output");
        return _this;
    }
    OutputModalComponent.prototype.onHelp = function () { };
    OutputModalComponent.prototype.onCancel = function () {
        this.dialogRef.close(this.data.preventReload);
    };
    OutputModalComponent.prototype.onSubmit = function () {
        this.dialogRef.close(this.data.preventReload);
    };
    OutputModalComponent = __decorate([
        (0, core_1.Component)({
            selector: 'app-output-modal',
            templateUrl: './output-modal.component.html',
            styleUrls: ['./output-modal.component.scss']
        }),
        __param(0, (0, core_1.Inject)(dialog_1.MAT_DIALOG_DATA)),
        __metadata("design:paramtypes", [Object, services_1.ElectronService,
            git_service_1.GitService,
            platform_browser_1.Title,
            dialog_1.MatDialogRef])
    ], OutputModalComponent);
    return OutputModalComponent;
}(electronable_modal_base_component_1.ElectronableModalBaseComponent));
exports.OutputModalComponent = OutputModalComponent;
//# sourceMappingURL=output-modal.component.js.map
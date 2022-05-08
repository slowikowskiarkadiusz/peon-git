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
exports.LocalStorageService = void 0;
var core_1 = require("@angular/core");
var git_service_1 = require("./electron/git.service");
var LocalStorageService = /** @class */ (function () {
    function LocalStorageService(gitService) {
        this.gitService = gitService;
    }
    LocalStorageService.prototype.get = function (storageKey, universal) {
        var key = storageKey;
        if (!universal)
            key = "".concat(storageKey, "-").concat(this.gitService.repoPath);
        return JSON.parse(localStorage.getItem(key));
    };
    LocalStorageService.prototype.set = function (storageKey, value, universal) {
        var key = storageKey;
        if (!universal)
            key = "".concat(storageKey, "-").concat(this.gitService.repoPath);
        localStorage.setItem(key, JSON.stringify(value));
    };
    LocalStorageService.prototype.remove = function (key) {
        localStorage.removeItem(key);
    };
    LocalStorageService = __decorate([
        (0, core_1.Injectable)({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [git_service_1.GitService])
    ], LocalStorageService);
    return LocalStorageService;
}());
exports.LocalStorageService = LocalStorageService;
//# sourceMappingURL=local-storage.service.js.map
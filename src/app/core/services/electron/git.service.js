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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printNameStatus = exports.GitService = void 0;
var core_1 = require("@angular/core");
var GitService = /** @class */ (function () {
    function GitService() {
        if (!!(window && window.process && window.process.type)) { // isElectron
            this.ipcRenderer = window.require('electron').ipcRenderer;
            this.webFrame = window.require('electron').webFrame;
            this.childProcess = window.require('child_process');
            this.fs = window.require('fs');
        }
    }
    GitService.prototype.setupRepo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run('git config --global status.showUntrackedFiles all')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(GitService.prototype, "repoName", {
        get: function () {
            if (this.repoPath) {
                var lastBackward = this.repoPath.lastIndexOf('\\');
                var lastForward = this.repoPath.lastIndexOf('/');
                var lastSlash = lastBackward > lastForward ? lastBackward : lastForward;
                return this.repoPath.substring(lastSlash + 1);
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    GitService.prototype.currentCommitHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("rev-list HEAD --max-count=1")];
                    case 1: return [2 /*return*/, (_a.sent()).stdout.split('\n')[0]];
                }
            });
        });
    };
    GitService.prototype.branches = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.run("branch"),
                            this.run("branch -r")
                        ])];
                    case 1: return [2 /*return*/, (_a.sent())
                            .flatMap(function (x, i) { return x.stdout.split('\n').map(function (y) { return { name: y, isRemote: i === 1 }; }); })
                            .map(function (x) {
                            var arr = x.name.trim().split(' ');
                            var isCurrent = arr[0] === '*';
                            return {
                                name: isCurrent ? arr[1] : arr[0],
                                isCurrent: isCurrent,
                                isRemote: x.isRemote
                            };
                        })
                            .filter(function (x) { return x.name != ''; })];
                }
            });
        });
    };
    GitService.prototype.assignAllCommits = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.run("rev-list --topo-order --all --pretty=\"%P%n%s%n%cI%n%an\"")];
                    case 1:
                        _a.allCommits = (_b.sent())
                            .stdout
                            .split('commit ')
                            .splice(1)
                            .map(function (x, i, c) {
                            var rec = x.split('\n');
                            return {
                                order: i,
                                hash: rec[0],
                                parentHashes: rec[1].split(' ').filter(function (v, i, c) { return c.indexOf(v) == i; }),
                                message: rec[2],
                                date: new Date(rec[3]),
                                author: rec[4],
                            };
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    GitService.prototype.remotes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.allCommits) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assignAllCommits()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.run('remote')];
                    case 3: return [2 /*return*/, (_a.sent())
                            .stdout
                            .split('\n')
                            .filter(function (x) { return x; })];
                }
            });
        });
    };
    GitService.prototype.commits = function (branch) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.allCommits) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.assignAllCommits()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.run("rev-list --topo-order ".concat(branch !== null && branch !== void 0 ? branch : '--all', " --pretty=\"%P%n%s%n%cI%n%an\""))];
                    case 3: return [2 /*return*/, (_a.sent())
                            .stdout
                            .split('commit ')
                            .splice(1)
                            .map(function (x) {
                            var rec = x.split('\n');
                            return {
                                order: _this.allCommits.map(function (x) { return x.hash; }).indexOf(rec[0]),
                                hash: rec[0],
                                parentHashes: rec[1].split(' '),
                                message: rec[2],
                                date: new Date(rec[3]),
                                author: rec[4],
                            };
                        })];
                }
            });
        });
    };
    GitService.prototype.diff = function (commitHash) {
        return __awaiter(this, void 0, void 0, function () {
            var commitTarget, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        commitTarget = commitHash ? "diff-tree ".concat(commitHash, "~ ").concat(commitHash) : 'diff';
                        _b = (_a = Promise).all;
                        return [4 /*yield*/, this.run("".concat(commitTarget, " --numstat"))];
                    case 1: return [2 /*return*/, _b.apply(_a, [(_c.sent())
                                .stdout
                                .split('\n')
                                .filter(function (x) { return x != '' && x != ' '; })
                                .map(function (x) { return __awaiter(_this, void 0, void 0, function () {
                                var res;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            res = x.split('\t').filter(function (x) { return x != '' && x != ' '; });
                                            _a = {
                                                commitHash: commitHash,
                                                linesAdded: res[0],
                                                linesRemoved: res[1],
                                                filePath: res[2],
                                                isTracked: true
                                            };
                                            return [4 /*yield*/, this.nameStatus(res[2], !commitHash, commitHash)];
                                        case 1: return [2 /*return*/, (_a.nameStatus = _b.sent(),
                                                _a)];
                                    }
                                });
                            }); })])];
                }
            });
        });
    };
    GitService.prototype.nameStatus = function (filePath, staged, commitHash) {
        return __awaiter(this, void 0, void 0, function () {
            var commitTarget, a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        commitTarget = commitHash ? "".concat(commitHash, "~ ").concat(commitHash) : '';
                        return [4 /*yield*/, this.run("diff ".concat(commitTarget, " ").concat(staged ? '--cached ' : '', "--name-status -- ").concat(filePath))];
                    case 1:
                        a = (_a.sent())
                            .stdout
                            .split('\t')[0];
                        return [2 /*return*/, a];
                }
            });
        });
    };
    GitService.prototype.lsUntracked = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("ls-files --others --exclude-standard")];
                    case 1: return [2 /*return*/, (_a.sent())
                            .stdout
                            .split('\n')
                            .filter(function (x) { return x != '' && x != ' '; })
                            .map(function (x) {
                            var res = x.split('\t').filter(function (x) { return x != '' && x != ' '; });
                            return {
                                linesAdded: '??',
                                linesRemoved: '??',
                                isTracked: false,
                                filePath: res[0],
                                isStaged: false,
                                nameStatus: 'X',
                            };
                        })];
                }
            });
        });
    };
    GitService.prototype.stage = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("add ".concat(filePath))];
                    case 1: return [2 /*return*/, (_a.sent()).stdout];
                }
            });
        });
    };
    GitService.prototype.unstage = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("remove ".concat(filePath))];
                    case 1: return [2 /*return*/, (_a.sent()).stdout];
                }
            });
        });
    };
    GitService.prototype.root = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run('rev-parse --show-toplevel', path)];
                    case 1: return [2 /*return*/, (_a.sent()).stdout.split('\n')[0]];
                }
            });
        });
    };
    GitService.prototype.isRepo = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run('-C . rev-parse', path)];
                    case 1: return [2 /*return*/, !(_a.sent()).stderr];
                }
            });
        });
    };
    GitService.prototype.lsFiles = function () {
        var paths = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            paths[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("ls-files -u -s -- ".concat(paths.join(' ')))];
                    case 1: return [2 /*return*/, (_a.sent())
                            .stdout
                            .split('\n')
                            .filter(function (x) { return x; })
                            .map(function (x) {
                            var arr = x.split('\t').flatMap(function (y) { return y.split(' '); });
                            return {
                                mode: arr[0],
                                hash: arr[1],
                                stage: arr[2],
                                filePath: arr[3],
                            };
                        })];
                }
            });
        });
    };
    GitService.prototype.getWorkingTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rowsRes, _a, rows, numStatsRes, _b, numStats, unversioned;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.run('diff-index --cached --raw HEAD -C -M --')];
                    case 1:
                        _a = (_c.sent()).stdout;
                        return [4 /*yield*/, this.run('diff-index --raw HEAD -C -M --')];
                    case 2:
                        rowsRes = _a + (_c.sent()).stdout;
                        rows = (rowsRes)
                            .split('\n')
                            .filter(function (x) { return x; })
                            .filter(function (x, i, c) { return c.indexOf(x) === i; })
                            .map(function (x) {
                            var arr = x.substring(1).split(' ').flatMap(function (y) { return y.split('\t'); });
                            return {
                                srcMode: arr[0],
                                dstMode: arr[1],
                                srcHash: arr[2],
                                dstHash: arr[3],
                                nameStatus: arr[4],
                                filePath: arr[5]
                            };
                        })
                            .filter(function (x, i, c) { return c.map(function (y) { return y.filePath; }).indexOf(x.filePath) === i; });
                        return [4 /*yield*/, this.run('diff-index --cached HEAD --numstat -C -M --')];
                    case 3:
                        _b = (_c.sent()).stdout;
                        return [4 /*yield*/, this.run('diff-index HEAD --numstat -C -M --')];
                    case 4:
                        numStatsRes = _b + (_c.sent()).stdout;
                        numStats = (numStatsRes)
                            .split('\n')
                            .filter(function (x) { return x; })
                            .filter(function (x, i, c) { return c.indexOf(x) === i; })
                            .map(function (x) {
                            var arr = x.split('\t');
                            return {
                                addedLines: arr[0],
                                deletedLines: arr[1],
                                filePath: arr[2],
                            };
                        })
                            .filter(function (x, i, c) { return c.map(function (y) { return y.filePath; }).indexOf(x.filePath) === i; });
                        return [4 /*yield*/, this.run('ls-files . --exclude-standard --others')];
                    case 5:
                        unversioned = (_c.sent())
                            .stdout
                            .split('\n')
                            .filter(function (x) { return x; })
                            .map(function (x) {
                            return {
                                filePath: x,
                                linesAdded: '??',
                                linesRemoved: '??',
                                commitHash: '',
                                isTracked: false,
                                nameStatus: 'unversioned'
                            };
                        });
                        return [2 /*return*/, rows
                                .map(function (x) {
                                var numStat = numStats.filter(function (y) { return y.filePath === x.filePath; })[0];
                                return {
                                    filePath: x.filePath,
                                    linesAdded: numStat === null || numStat === void 0 ? void 0 : numStat.addedLines,
                                    linesRemoved: numStat === null || numStat === void 0 ? void 0 : numStat.deletedLines,
                                    commitHash: '',
                                    isTracked: true,
                                    nameStatus: x.nameStatus
                                };
                            })
                                .concat(unversioned)
                                .sort(function (x, y) { return x.filePath > y.filePath ? 1 : -1; })];
                }
            });
        });
    };
    GitService.prototype.run = function (command, customPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ipcRenderer.invoke("run-git", customPath !== null && customPath !== void 0 ? customPath : this.repoPath, command)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GitService = __decorate([
        (0, core_1.Injectable)({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], GitService);
    return GitService;
}());
exports.GitService = GitService;
function printNameStatus(nameStatus) {
    switch (nameStatus) {
        case 'A': return 'Added';
        case 'C': return 'Copied';
        case 'D': return 'Deleted';
        case 'M': return 'Modified';
        case 'R': return 'Renamed';
        case 'T': return 'Type-changed';
        case 'U': return 'Unmerged';
        case 'X': return 'Unknown';
        case 'B': return 'Broken';
        case 'unversioned': return 'Unversioned';
    }
}
exports.printNameStatus = printNameStatus;
//# sourceMappingURL=git.service.js.map
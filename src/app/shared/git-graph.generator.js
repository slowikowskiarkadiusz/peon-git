"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitGraph = exports.makeGitGraph = void 0;
function makeGitGraph(branches, currentCommitHash, isWorkingTree) {
    var heads = [];
    var lookup = [];
    var gitGraph = new GitGraph();
    // const currentBranch = branches.filter(x => x.isCurrent)[0];
    // branches.splice(branches.indexOf(currentBranch), 1);
    // branches.splice(0, 0, currentBranch);
    branches.filter(function (x) { return x.commits.length; }).forEach(function (x) { return addToHeads(x, heads, lookup); });
    heads.forEach(function (x) { return addToGraph(x, gitGraph); });
    gitGraph.connectLanes();
    var workingTreeLane = null;
    if (isWorkingTree) {
        workingTreeLane = addWorkingTreeCommit(gitGraph, currentCommitHash);
    }
    gitGraph.orderLanes(workingTreeLane);
    return gitGraph;
}
exports.makeGitGraph = makeGitGraph;
function addWorkingTreeCommit(gitGraph, currentCommitHash) {
    var workingTreeCommit = {
        order: -1,
        parentHashes: [],
        hash: '',
        message: "Working tree changes",
        date: new Date(),
        author: ''
    };
    var workingTreeCommitCell = {
        commit: workingTreeCommit,
        lane: undefined,
        branches: []
    };
    var toCc = gitGraph.commitCells.filter(function (x) { return x.commit.hash === currentCommitHash; })[0];
    var lane = {
        x: 0,
        commitCells: [],
        from: workingTreeCommitCell,
        to: toCc,
    };
    workingTreeCommitCell.lane = lane;
    addToGraph({ commit: workingTreeCommit, next: [], branches: [], }, gitGraph, lane, true);
    return lane;
}
function addToGraph(node, graph, lane, stale) {
    if (!node)
        return;
    if (graph.isEmpty) {
        lane = graph.pushToLane({ commit: node.commit, lane: lane, branches: node.branches });
        node.next.forEach(function (x) { return addToGraph(x, graph, lane); });
        return;
    }
    if (graph.findCommit(node.commit))
        return;
    lane = graph.pushToLane({ commit: node.commit, lane: lane, branches: node.branches }, stale);
    node.next.forEach(function (x) { return addToGraph(x, graph, lane); });
}
function addNode(commit, parentNode, heads, lookup) {
    var newNode = { commit: commit, next: [], branches: [] };
    parentNode === null || parentNode === void 0 ? void 0 : parentNode.next.push(newNode);
    if (!parentNode)
        heads.push(newNode);
    lookup.push({ commit: commit, node: newNode });
    return newNode;
}
function searchLookup(wantedCommitHash, lookup) {
    var arr = lookup.filter(function (x) { return x.commit.hash == wantedCommitHash; });
    return arr.length > 0 ? arr[0].node : null;
}
function addToHeads(branch, heads, lookup) {
    var node = searchLookup(branch.commits[0].hash, lookup);
    if (!node) {
        node = addNode(branch.commits[0], null, heads, lookup);
    }
    node.branches.push(branch);
    var parentNode = node;
    for (var _i = 0, _a = branch.commits.slice(1); _i < _a.length; _i++) {
        var commit = _a[_i];
        var found = searchLookup(commit.hash, lookup);
        if (!found)
            node = addNode(commit, parentNode, heads, lookup);
        else {
            parentNode.next.push(found);
            return;
        }
        parentNode = node;
    }
}
var GitGraph = /** @class */ (function () {
    function GitGraph() {
        this.lanes = [];
        this.commitCells = [];
    }
    Object.defineProperty(GitGraph.prototype, "isEmpty", {
        get: function () {
            return this.commitCells.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GitGraph.prototype, "size", {
        get: function () {
            return {
                width: this.lanes.reduce(function (p, c) { return p.x > c.x ? p : c; }).x + 1,
                height: this.commitCells.length + 1,
            };
        },
        enumerable: false,
        configurable: true
    });
    GitGraph.prototype.findCommit = function (commit) {
        for (var _i = 0, _a = this.commitCells; _i < _a.length; _i++) {
            var commitCell = _a[_i];
            if (commitCell.commit.hash == commit.hash) {
                return commitCell;
            }
        }
        return null;
    };
    GitGraph.prototype.getCommitCellAt = function (index) {
        return this.commitCells[index];
    };
    GitGraph.prototype.pushToLane = function (entry, stale) {
        var pushingIndexY = this.getWhereToPush(entry.commit);
        if (entry.lane && !stale) {
            entry.lane.commitCells.push(entry);
            entry.lane.to = entry;
        }
        else {
            var lane = { x: -1, commitCells: [entry], from: entry, to: entry };
            entry.lane = lane;
            this.lanes.push(lane);
        }
        this.commitCells.splice(pushingIndexY, 0, entry);
        return entry.lane;
    };
    GitGraph.prototype.connectLanes = function () {
        var _this = this;
        this.commitCells.forEach(function (cc) {
            cc.commit.parentHashes.forEach(function (ph) {
                var tos = _this.commitCells.filter(function (x) { return x.commit.hash == ph; });
                if (tos.length > 0) {
                    var sameLane = tos[0].lane === cc.lane;
                    var tosI = _this.commitCells.indexOf(tos[0]);
                    var ccI = _this.commitCells.indexOf(cc);
                    var areConsecutive = Math.abs(tosI - ccI) === 1;
                    if (!sameLane || !areConsecutive) {
                        _this.lanes.push({ x: -1, commitCells: [], from: cc, to: tos[0] });
                    }
                }
            });
        });
    };
    GitGraph.prototype.orderLanes = function (workingTreeLane) {
        var _this = this;
        if (workingTreeLane) {
            this.lanes.splice(0, 0, workingTreeLane);
        }
        this.lanes.forEach(function (lane) { return lane.x = _this.getFirstEmptyLane(lane); });
        if (workingTreeLane) {
            var workingTreeCommit = this.lanes.filter(function (x) { return x.commitCells.length === 1 && x.commitCells[0].commit.hash == workingTreeLane.from.commit.hash; })[0];
            if (workingTreeCommit)
                workingTreeCommit.x = 0;
        }
    };
    GitGraph.prototype.getWhereToPush = function (commit) {
        var i = 0;
        for (; i < this.commitCells.length; i++) {
            if (commit.order < this.commitCells[i].commit.order)
                break;
        }
        return i;
    };
    GitGraph.prototype.getFirstEmptyLane = function (forLane) {
        var _this = this;
        var laneIndex = 0;
        var from1 = this.commitCells.indexOf(forLane.from) - 3;
        var to1 = this.commitCells.indexOf(forLane.to) + 3;
        var collection = this.lanes
            .filter(function (x) { return forLane != x; })
            .filter(function (x) { return x.x >= 0; })
            .sort(function (a, b) { return a.x - b.x; })
            .filter(function (lane) {
            var from2 = _this.commitCells.indexOf(lane.from) - 3;
            var to2 = _this.commitCells.indexOf(lane.to) + 3;
            return (from1 < from2 && to1 > to2) ||
                (from1 > from2 && from1 < to2) ||
                (to1 > from2 && to1 < to2) ||
                (from2 < from1 && to2 > to1) ||
                (from2 > from1 && from2 < to1) ||
                (to2 > from1 && to2 < to1);
        })
            .map(function (x) { return x.x; });
        collection = collection.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
        for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
            var laneX = collection_1[_i];
            if (laneIndex != laneX)
                break;
            else
                laneIndex++;
        }
        return laneIndex;
    };
    GitGraph.prototype.getFirstEmptyLane2 = function (forLane) {
        var collection = this.lanes
            .filter(function (x) { return forLane != x; })
            .filter(function (x) { return x.x >= 0; })
            .map(function (x) { return x.x; });
        return collection.length > 0 ? collection.reduce(function (p, c) { return p > c ? p : c; }) : 0;
    };
    return GitGraph;
}());
exports.GitGraph = GitGraph;
//# sourceMappingURL=git-graph.generator.js.map
import { Commit } from "../core/services/electron/git.service";

export function makeGitGraph(branches: Branch[], currentCommitHash: string, isWorkingTree: boolean): GitGraph {
    let heads: Node[] = [];
    let lookup: Lookup[] = [];
    let gitGraph = new GitGraph();

    // const currentBranch = branches.filter(x => x.isCurrent)[0];
    // branches.splice(branches.indexOf(currentBranch), 1);
    // branches.splice(0, 0, currentBranch);

    branches.filter(x => x.commits.length).forEach(x => addToHeads(x, heads, lookup));

    heads.forEach(x => addToGraph(x, gitGraph));

    gitGraph.connectLanes();

    let workingTreeLane: Lane = null;
    if (isWorkingTree) {
        workingTreeLane = addWorkingTreeCommit(gitGraph, currentCommitHash);
    }

    gitGraph.orderLanes(workingTreeLane);

    return gitGraph;
}

function addWorkingTreeCommit(gitGraph: GitGraph, currentCommitHash: string): Lane {
    const workingTreeCommit: Commit = {
        order: -1,
        parentHashes: [],
        hash: '',
        message: "Working tree changes",
        date: new Date(),
        author: ''
    };
    let workingTreeCommitCell: CommitCell = {
        commit: workingTreeCommit,
        lane: undefined,
        branches: []
    };
    let toCc = gitGraph.commitCells.filter(x => x.commit.hash === currentCommitHash)[0];
    let lane = {
        x: 0,
        commitCells: [],
        from: workingTreeCommitCell,
        to: toCc,
    };
    workingTreeCommitCell.lane = lane;
    addToGraph({ commit: workingTreeCommit, next: [], branches: [], }, gitGraph, lane, true);
    return lane;
}

function addToGraph(node: Node, graph: GitGraph, lane?: Lane, stale?: boolean): void {
    if (!node) return;

    if (graph.isEmpty) {
        lane = graph.pushToLane({ commit: node.commit, lane: lane, branches: node.branches });
        node.next.forEach(x => addToGraph(x, graph, lane));
        return;
    }

    if (graph.findCommit(node.commit)) return;

    lane = graph.pushToLane({ commit: node.commit, lane: lane, branches: node.branches }, stale);
    node.next.forEach(x => addToGraph(x, graph, lane));
}

function addNode(commit: Commit, parentNode: Node, heads: Node[], lookup: Lookup[]): Node {
    let newNode = { commit: commit, next: [], branches: [] } as Node;

    parentNode?.next.push(newNode);

    if (!parentNode)
        heads.push(newNode);

    lookup.push({ commit: commit, node: newNode });

    return newNode;
}

function searchLookup(wantedCommitHash: string, lookup: Lookup[]): Node | null {
    let arr = lookup.filter(x => x.commit.hash == wantedCommitHash);
    return arr.length > 0 ? arr[0].node : null;
}

function addToHeads(branch: Branch, heads: Node[], lookup: Lookup[]): void {
    let node = searchLookup(branch.commits[0].hash, lookup);
    if (!node) {
        node = addNode(branch.commits[0], null, heads, lookup);
    }

    node.branches.push(branch);

    let parentNode = node;
    for (let commit of branch.commits.slice(1)) {
        let found = searchLookup(commit.hash, lookup);

        if (!found)
            node = addNode(commit, parentNode, heads, lookup);
        else {
            parentNode.next.push(found);
            return;
        }

        parentNode = node;
    }
}

export interface Node {
    commit: Commit;
    next: Node[];
    branches: Branch[];
}

export interface Lookup {
    commit: Commit;
    node: Node;
}

export class GitGraph {
    public lanes: Lane[] = [];
    public commitCells: CommitCell[] = [];

    public get isEmpty(): boolean {
        return this.commitCells.length === 0;
    }

    public get size(): { width: number, height: number } {
        return {
            width: this.lanes.reduce((p, c) => p.x > c.x ? p : c).x + 1,
            height: this.commitCells.length + 1,
        };
    }

    public findCommit(commit: Commit): CommitCell {
        for (let commitCell of this.commitCells) {
            if (commitCell.commit.hash == commit.hash) {
                return commitCell;
            }
        }
        return null;
    }

    public getCommitCellAt(index: number): CommitCell {
        return this.commitCells[index];
    }

    public pushToLane(entry: CommitCell, stale?: boolean): Lane {
        let pushingIndexY: number = this.getWhereToPush(entry.commit);

        if (entry.lane && !stale) {
            entry.lane.commitCells.push(entry);
            entry.lane.to = entry;
        }
        else {
            let lane = { x: -1, commitCells: [entry], from: entry, to: entry };
            entry.lane = lane;
            this.lanes.push(lane);
        }

        this.commitCells.splice(pushingIndexY, 0, entry);

        return entry.lane;
    }

    public connectLanes(): void {
        this.commitCells.forEach(cc => {
            cc.commit.parentHashes.forEach(ph => {
                let tos: CommitCell[] = this.commitCells.filter(x => x.commit.hash == ph);
                if (tos.length > 0) {
                    let sameLane = tos[0].lane === cc.lane;
                    let tosI = this.commitCells.indexOf(tos[0]);
                    let ccI = this.commitCells.indexOf(cc);
                    let areConsecutive = Math.abs(tosI - ccI) === 1;

                    if (!sameLane || !areConsecutive) {
                        this.lanes.push({ x: -1, commitCells: [], from: cc, to: tos[0] });
                    }
                }
            });
        });
    }

    public orderLanes(workingTreeLane: Lane): void {
        if (workingTreeLane) {
            this.lanes.splice(0, 0, workingTreeLane);
        }

        this.lanes.forEach(lane => lane.x = this.getFirstEmptyLane(lane));

        if (workingTreeLane) {
            let workingTreeCommit = this.lanes.filter(x => x.commitCells.length === 1 && x.commitCells[0].commit.hash == workingTreeLane.from.commit.hash)[0];
            if (workingTreeCommit) workingTreeCommit.x = 0;
        }
    }

    private getWhereToPush(commit: Commit): number {
        let i = 0;
        for (; i < this.commitCells.length; i++) {
            if (commit.order < this.commitCells[i].commit.order)
                break;
        }
        return i;
    }

    private getFirstEmptyLane(forLane: Lane): number {
        let laneIndex: number = 0;
        let from1 = this.commitCells.indexOf(forLane.from) - 3;
        let to1 = this.commitCells.indexOf(forLane.to) + 3;

        let collection = this.lanes
            .filter(x => forLane != x)
            .filter(x => x.x >= 0)
            .sort((a, b) => a.x - b.x)
            .filter(lane => {
                let from2 = this.commitCells.indexOf(lane.from) - 3;
                let to2 = this.commitCells.indexOf(lane.to) + 3;

                return (from1 < from2 && to1 > to2) ||
                    (from1 > from2 && from1 < to2) ||
                    (to1 > from2 && to1 < to2) ||
                    (from2 < from1 && to2 > to1) ||
                    (from2 > from1 && from2 < to1) ||
                    (to2 > from1 && to2 < to1);
            })
            .map(x => x.x);

        collection = collection.filter((item, i, ar) => ar.indexOf(item) === i);

        for (let laneX of collection) {
            if (laneIndex != laneX) break;
            else laneIndex++;
        }
        return laneIndex;
    }

    private getFirstEmptyLane2(forLane: Lane): number {
        let collection = this.lanes
            .filter(x => forLane != x)
            .filter(x => x.x >= 0)
            .map(x => x.x);

        return collection.length > 0 ? collection.reduce((p, c) => p > c ? p : c) : 0;
    }
}

export interface CommitCell {
    commit: Commit;
    lane: Lane;
    branches: Branch[];
}

export interface Lane {
    x: number;
    commitCells: CommitCell[];
    from: CommitCell;
    to: CommitCell;
}

export interface Branch {
    name: string;
    isCurrent: boolean;
    isRemote: boolean;
    commits?: Commit[];
}
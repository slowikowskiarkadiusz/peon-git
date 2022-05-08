import { GitGraph, Lane } from "./git-graph.generator";

export interface GitGraphOptions {
    commitSize: number,
    rowMarginX: number,
    rowMarginY: number,
};

export interface GraphSetupResult {
    height: number,
    width: number,
    rowHeight: number,
    tableStyle: string
}

export function graphSetup(
    graphSize: { width: number, height: number },
    options: GitGraphOptions): GraphSetupResult {
    let result = setGraphSize(graphSize.width, graphSize.height, options);

    return {
        rowHeight: result.rowHeight,
        height: result.graphHeight,
        width: result.graphWidth,
        tableStyle: result.tableStyle
    };
}

export function paintGraph(gitGraph: GitGraph, ctx: CanvasRenderingContext2D, options: GitGraphOptions): void {
    setTimeout(() => {
        gitGraph.lanes.forEach(lane => {
            const fromIndex = gitGraph.commitCells.indexOf(lane.from);
            const toIndex = gitGraph.commitCells.indexOf(lane.to);

            const isDirectLane =
                ((Math.abs(fromIndex - toIndex) <= 1) &&
                    lane.from.lane.x === lane.to.lane.x)
                ||
                ((lane.x === lane.from.lane.x && lane.x === lane.to.lane.x) &&
                    Math.abs(lane.from.lane.commitCells.indexOf(lane.from) - lane.to.lane.commitCells.indexOf(lane.to)) <= 1)
                ||
                (lane.commitCells.includes(lane.from) && lane.commitCells.includes(lane.to));

            ctx.beginPath();
            ctx.lineWidth = 2;

            if (!isDirectLane) {
                paintAngularLane(lane, fromIndex, options, toIndex, ctx);
            }
            else {
                paintStraightLane(lane, gitGraph, options, ctx);
            }

            ctx.stroke();
            ctx.closePath();
        });

        gitGraph.commitCells.forEach((cc, ccI) => {
            const pos = getDotPos(cc.lane.x, ccI, options, false);
            ctx.fillStyle = getColorFor(cc.lane);
            ctx.fillRect(pos.x, pos.y, options.commitSize, options.commitSize);
        });
    }, 0);
}

function paintAngularLane(lane: Lane, fromIndex: number, options: GitGraphOptions, toIndex: number, ctx: CanvasRenderingContext2D) {
    const upDir = (lane.x - lane.from.lane.x) > 0 ? -1 : 1;
    const lowDir = (lane.x - lane.to.lane.x) > 0 ? -1 : 1;
    const upCell = getDotPos(lane.from.lane.x, fromIndex, options);
    const lowCell = getDotPos(lane.to.lane.x, toIndex, options);
    const vertUp = getDotPos(lane.x, fromIndex, options);
    const vertDown = getDotPos(lane.x, toIndex, options);

    const areConsecutive = toIndex - fromIndex === 1;

    ctx.strokeStyle = getColorFor(lane.from.lane);

    // from up to vertical // up to vertical - corner
    if (vertUp.x != upCell.x) {
        ctx.moveTo(upCell.x, upCell.y);
        ctx.lineTo(vertUp.x + inGraphUnitsX(upDir, options), vertUp.y);
        ctx.moveTo(vertUp.x + inGraphUnitsX(upDir, options), upCell.y);
        // ctx.stroke();
    }

    // let gradient = ctx.createLinearGradient(0, 0, 1, 1);
    // gradient.addColorStop(0, getColorFor(lane.from.lane.x));
    // gradient.addColorStop(1, getColorFor(lane.to.lane.x));
    // ctx.strokeStyle = gradient;
    ctx.quadraticCurveTo(
        vertUp.x,
        vertUp.y,
        vertUp.x,
        !areConsecutive ? vertUp.y + inGraphUnitsY(1, options) : (vertDown.y + vertUp.y) / 2);
    // ctx.stroke();

    // vertical
    if (!areConsecutive) {
        // ctx.strokeStyle = getColorFor(lane.from.lane.x);
        ctx.moveTo(vertUp.x, vertUp.y + inGraphUnitsY(1, options));
        ctx.lineTo(vertDown.x, vertDown.y - inGraphUnitsY(1, options));
        // ctx.stroke();
    }

    // from vertical to low // vertical to low - corner
    if (vertDown.x != lowCell.x) {
        // ctx.strokeStyle = getColorFor(lane.from.lane.x);
        ctx.moveTo(lowCell.x, lowCell.y);
        ctx.lineTo(vertDown.x + inGraphUnitsX(lowDir, options), vertDown.y);
        ctx.moveTo(vertDown.x + inGraphUnitsX(lowDir, options), lowCell.y);
        // ctx.stroke();
        let gradient = ctx.createLinearGradient(0, 0, 1, 1);
        gradient.addColorStop(0, getColorFor(lane.from.lane));
        gradient.addColorStop(1, getColorFor(lane.to.lane));
        // ctx.strokeStyle = gradient;
        ctx.quadraticCurveTo(
            vertDown.x,
            vertDown.y,
            vertDown.x,
            !areConsecutive ? vertDown.y - inGraphUnitsY(1, options) : (vertDown.y + vertUp.y) / 2);
        // ctx.stroke();
    }
    else {
        ctx.lineTo(lowCell.x, lowCell.y);
    }
}

function paintStraightLane(lane: Lane, gitGraph: GitGraph, options: GitGraphOptions, ctx: CanvasRenderingContext2D) {
    const from = getDotPos(lane.x, gitGraph.commitCells.indexOf(lane.from), options);
    const to = getDotPos(lane.x, gitGraph.commitCells.indexOf(lane.to), options);
    ctx.strokeStyle = getColorFor(lane.from.lane);
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
}

function setGraphSize(width: number, height: number, options: GitGraphOptions): { graphWidth: number, graphHeight: number, tableStyle: string, rowHeight: number } {
    const graphWidth = width * (options.commitSize + options.rowMarginX) + options.rowMarginX;
    const rowHeight: number = options.commitSize + options.rowMarginY * 2;

    return {
        graphWidth: graphWidth,
        graphHeight: height * (options.commitSize + options.rowMarginY * 2),
        tableStyle: `grid-template-columns: max-content ${graphWidth}px auto max-content max-content max-content; grid-template-rows: repeat(${height}, ${rowHeight}px);`,
        rowHeight: rowHeight,
    };
}

function getColorFor(lane: Lane): string {
    let isRelatedToWorkingTree = lane.from.commit.hash == '' || lane.to.commit.hash == '';

    if (!isRelatedToWorkingTree) {
        switch (lane.x) {
            case 0: return 'rgb(231, 233, 235)';
            case 1: return 'rgb(100, 100, 255)';
            case 2: return 'rgb(255, 125, 0)';
            case 3: return 'rgb(190, 0, 0)';
            case 4: return 'rgb(218, 247, 166)';
            case 5: return 'rgb(0, 255, 255)';
            case 6: return 'rgb(255, 0, 255)';
            case 7: return 'rgb(231, 233, 235)';
            case 8: return 'rgb(0, 0, 255)';
            case 9: return 'rgb(255, 125, 0)';
            case 10: return 'rgb(190, 0, 0)';
            case 11: return 'rgb(218, 247, 166)';
            case 12: return 'rgb(0, 255, 255)';
            case 13: return 'rgb(255, 0, 255)';
        }
    }
    else {
        return 'rgb(0, 190, 0)';
    }
}

function getDotPos(x: number, y: number, options: GitGraphOptions, offset: boolean = true): { x: number, y: number } {
    return {
        x: inGraphUnitsX(x, options) + (offset ? options.commitSize / 2 : 0),
        y: inGraphUnitsY(y, options) + (offset ? options.commitSize / 2 : 0),
    };
}

function inGraphUnitsX(x: number, options: GitGraphOptions): number {
    return x * (options.rowMarginX + options.commitSize) + options.rowMarginX;
}

function inGraphUnitsY(y: number, options: GitGraphOptions): number {
    return y * (options.rowMarginY * 2 + options.commitSize) + options.rowMarginY;
}
import { DatePipe } from '@angular/common';
import { AfterContentInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Commit } from '../../core/services/electron/git.service';
import { TabService } from '../../core/services/tab.service';
import { Branch, GitGraph, makeGitGraph } from '../../shared/git-graph.generator';
import { GitGraphOptions, graphSetup, paintGraph, GraphSetupResult as GitGraphSetupResult } from '../../shared/git-graph.painter';

interface TableRow {
  lp: number;
  branches: Branch[];
  message: string;
  hash: string;
  author: string;
  date: Date;
  isCurrent: boolean;
  currentBranch?: Branch;
}

export interface GitGraphContextMenuMsg {
  commits: Commit[],
  branch?: Branch,
  branchesAtCommit: Branch[],
}

@Component({
  selector: 'app-git-graph',
  templateUrl: './git-graph.component.html',
  styleUrls: ['./git-graph.component.scss']
})
export class GitGraphComponent implements OnInit, AfterContentInit {
  @Input() public currentCommit: string = null;
  @Input() public currentBranch: Branch = null;
  @Input() public branches: Branch[] = null;
  @Input() public isWorkingTree: boolean = false;

  @Output() public onCommitFocusChange: EventEmitter<Commit> = new EventEmitter<Commit>();
  @Output() public onContextMenu: EventEmitter<GitGraphContextMenuMsg> = new EventEmitter<GitGraphContextMenuMsg>();

  public doRender: boolean = false;
  public tableStyle: string = null;
  public graphHeight: number = 0;
  public graphWidth: number = 0;
  public tableRows: TableRow[] = [];
  public hoveredRow: number = -1;
  public selectedRows: number[] = [];
  public relatedCells: number[] = [];

  private gitGraph: GitGraph = null;

  private readonly options: GitGraphOptions = {
    commitSize: 9,
    rowMarginX: 4,
    rowMarginY: 4
  };

  constructor(
    private tabService: TabService,
    private datePipe: DatePipe) { }

  public get selectedRow(): number {
    if (this.selectedRows.length === 1) return this.selectedRows[0];
    else return -1;
  }

  public set selectedRow(rowI: number) {
    if (this.selectedRows.length > 0)
      this.selectedRows = [];

    this.selectedRows.push(rowI);
  }

  public ngOnInit(): void {
    if (!this.currentCommit || !this.branches) return;

    this.gitGraph = makeGitGraph(this.branches, this.currentCommit, this.isWorkingTree);

    this.prepareTableData();

    this.doRender = true;

    setTimeout(() => {
      let canvas: any = document.getElementById('graph');
      let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
      this.setupGraph(graphSetup(this.gitGraph.size, this.options));
      paintGraph(this.gitGraph, ctx, this.options);
    }, 0);
  }

  public ngAfterContentInit(): void {
    this.onRowSelectedEnter(this.tabService.getCurrentGraphRow() ?? 0);
  }

  public onContextMenuClicked(event: MouseEvent, rowI: number, branch?: Branch): void {
    if (!this.selectedRows.includes(rowI))
      this.onRowSelectedEnter(rowI, event);

    this.onContextMenu.emit({
      commits: this.selectedRows?.length > 1 ?
        this.selectedRows.map(x => this.gitGraph.getCommitCellAt(x).commit) :
        [this.gitGraph.getCommitCellAt(rowI).commit],
      branch: branch,
      branchesAtCommit: this.gitGraph.getCommitCellAt(rowI).branches ?? []
    });

    event.stopPropagation();
  }

  public date(row: TableRow): string {
    try {
      return this.datePipe.transform(row.date, 'dd-MM-yyyy');
    }
    catch {
      return 'error';
    }
  }

  public onRowHoverEnter(rowIndex: number): void {
    this.hoveredRow = rowIndex;
  }

  public onRowHoverExit(rowIndex: number): void {
    if (this.hoveredRow == rowIndex) {
      this.hoveredRow = -1;
    }
  }

  public onRowSelectedEnter(rowIndex: number, event?: MouseEvent): void {
    if (event?.shiftKey && this.selectedRow) {
      let arr = [this.selectedRow, rowIndex];
      let min = arr.reduce((p, c) => p < c ? p : c);
      let max = arr.reduce((p, c) => p > c ? p : c);
      this.selectedRows = Array(max - min + 1).fill(0).map((v, i) => min + i);
      this.relatedCells = [];
    } else {
      if (this.selectedRow == rowIndex) {
        this.selectedRow = -1;
        this.relatedCells = [];
      } else {
        this.selectedRow = rowIndex;
        this.relatedCells = this.gitGraph.commitCells[rowIndex].commit.parentHashes
          .map(x => this.gitGraph.commitCells.map(x => x.commit.hash).indexOf(x));

        this.relatedCells.concat(this.gitGraph.commitCells
          .filter(cc => cc.commit.parentHashes.includes(this.gitGraph.commitCells[rowIndex].commit.hash))
          .map(cc => this.gitGraph.commitCells.indexOf(cc)));

        setTimeout(() => {
          this.onCommitFocusChange.next(this.gitGraph.commitCells[rowIndex].commit);
        }, 1);
      }
    }

    this.tabService.setCurrentGraphRow(this.selectedRow);
  }

  private setupGraph(graphSetupResult: GitGraphSetupResult): void {
    this.graphHeight = graphSetupResult.height;
    this.graphWidth = graphSetupResult.width;
    this.tableStyle = graphSetupResult.tableStyle;
  }

  private prepareTableData(): void {
    this.gitGraph.commitCells.forEach((cc, i) => {
      this.tableRows.push({
        lp: i,
        branches: cc.branches,
        message: cc.commit.message,
        hash: cc.commit.hash,
        date: cc.commit.date,
        author: cc.commit.author,
        isCurrent: cc.commit.hash == this.currentCommit,
        currentBranch: cc.branches.includes(this.currentBranch) ? this.currentBranch : null,
      });
    });
  }

}
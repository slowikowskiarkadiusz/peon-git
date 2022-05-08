import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Commit } from '../../core/services/electron/git.service';
import { Branch } from '../../shared/git-graph.generator';

interface TableRow {
  lp: number;
  message: string;
  hash: string;
  author: string;
  date: Date;
}

export interface CommitListContextMenuMsg {
  commits: Commit[],
  branch?: Branch,
}

@Component({
  selector: 'app-commit-list',
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.scss']
})
export class CommitListComponent implements OnInit {
  @Input() public commits: Commit[] = [];
  @Input() public goodHighlightedRow: number = -1;
  @Input() public badHighlightedRow: number = -1;

  @Output() public commitFocusChange: EventEmitter<Commit> = new EventEmitter<Commit>();
  @Output() public contextMenu: EventEmitter<CommitListContextMenuMsg> = new EventEmitter<CommitListContextMenuMsg>();

  public tableRows: TableRow[] = [];
  public hoveredRow: number = -1;
  public selectedRows: number[] = [];

  private rowHeight: number = 18;

  constructor(private datePipe: DatePipe) { }

  public get tableStyle(): string {
    return `grid-template-columns: max-content auto max-content max-content max-content; grid-template-rows: repeat(${this.commits}, ${this.rowHeight}px);`;
  }

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
    this.tableRows = this.commits.map((commit, i) => {
      return {
        lp: i,
        message: commit.message,
        hash: commit.hash,
        date: commit.date,
        author: commit.author
      }
    });
  }

  public onContextMenuClicked(event: MouseEvent, rowI: number, branch?: Branch): void {
    if (!this.selectedRows.includes(rowI))
      this.onRowSelectedEnter(rowI, event);

    this.contextMenu.emit({
      commits: this.selectedRows?.length > 1 ?
        this.selectedRows.map(x => this.commits[x]) :
        [this.commits[rowI]],
      branch: branch,
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
    } else {
      if (this.selectedRow == rowIndex) {
        this.selectedRow = -1;
      }
      else {
        this.selectedRow = rowIndex;
        this.commitFocusChange.next(this.commits[rowIndex]);
      }
    }
  }
}


import { AfterContentInit, Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FileInfo, printNameStatus } from '../../core/services/electron/git.service';
import { TabService } from '../../core/services/tab.service';
import { getName, getFolder } from '../../shared/file.helper';

@Component({
  selector: 'app-changes-list',
  templateUrl: './changes-list.component.html',
  styleUrls: ['./changes-list.component.scss']
})
export class ChangesListComponent implements OnChanges, AfterContentInit {
  @Input() public fileInfos: FileInfo[] = [];
  @Input() public checkboxes: boolean = false;

  @Output() public contextMenu: EventEmitter<FileInfo[]> = new EventEmitter<FileInfo[]>();
  @Output() public checkedChange: EventEmitter<FileInfo[]> = new EventEmitter<FileInfo[]>();

  public hoveredRow: number = 0;
  public selectedRows: number[] = [];
  public tableStyle: string;
  public checked: boolean[] = [];

  constructor(private tabService: TabService) { }

  public get allChecked(): boolean {
    return this.checked.filter(x => x).length === this.checked.length;
  }

  public get selectedRow(): number {
    if (this.selectedRows.length === 1) return this.selectedRows[0];
    else return 0;
  }

  public set selectedRow(rowI: number) {
    if (this.selectedRows.length > 0)
      this.selectedRows = [];

    this.selectedRows.push(rowI);
  }

  @HostListener('window:keydown', ['$event'])
  public keyEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() == 'a')
      this.selectAll();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.fileInfos.length > 0) {
      this.tableStyle = `grid-template-columns: ${this.checkboxes ? 'max-content' : ''} auto max-content max-content max-content; grid-template-rows: repeat(${this.fileInfos.length + 1}, min-content)`;
      this.checked = Array(this.fileInfos.length).fill(false);
      this.checkedChange.emit(this.fileInfos.filter((v, i) => this.checked[i]));
      // this.onRowSelectedEnter(this.tabService.getCurrentChangeListRow());
    }
  }

  public ngAfterContentInit(): void {
    this.onRowSelectedEnter(this.tabService.getCurrentChangeListRow() ?? 0);
  }

  public fullNameStatus(fileInfo: FileInfo): string {
    return printNameStatus(fileInfo.nameStatus);
  }

  public onFileCheckboxClicked(event: Event & any, index?: number): void {
    if (index !== undefined) {
      this.checked[index] = event.target.checked;
    }
    else {
      this.checked = Array(this.fileInfos.length).fill(event.target.checked);
    }

    this.checkedChange.emit(this.fileInfos.filter((v, i) => this.checked[i]));
  }

  public onContextMenuClicked(rowI: number, event: MouseEvent): void {
    if (!this.selectedRows.includes(rowI))
      this.onRowSelectedEnter(rowI, event);

    this.contextMenu.emit(
      this.selectedRows.length > 1 ? this.fileInfos.filter((v, i) => this.selectedRows.includes(i)) :
        [this.fileInfos[rowI]]);
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
      if (this.selectedRows[0] == rowIndex) {
        this.selectedRows = [];
      }
      else {
        this.selectedRow = rowIndex;
      }
    }

    this.tabService.setCurrentChangeListRow(this.selectedRow);
  }

  public getName(filePath: string): string {
    return getName(filePath);
  }

  public getFolder(filePath: string): string {
    return getFolder(filePath);
  }

  private selectAll() {
    this.selectedRows = Array.from(Array(this.fileInfos.length).keys());
  }
}

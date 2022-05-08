import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tab-content',
  templateUrl: './tab-content.component.html',
  styleUrls: ['./tab-content.component.scss']
})
export class TabContentComponent implements OnChanges {
  @Input() public tabData: TabData;

  @Output() public tabDataChanged: EventEmitter<TabData> = new EventEmitter<TabData>();

  constructor() { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.tabData) {
    }
  }

  public newTabDataEmitted(event: TabData): void {
    // this.tabData = event;
    this.tabDataChanged.emit(event);
  }

  public isTabValid(tabData: TabData): boolean {
    return !!tabData.location;
  }
}

export interface TabData {
  location?: string;
}
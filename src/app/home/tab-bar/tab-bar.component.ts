import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getName } from '../../shared/file.helper';
import { TabData } from '../tab-content/tab-content.component';

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent {
  @Input() public allTabs: TabData[] = null;
  @Input() public currentTabIndex: number = -1;

  @Output() public allTabsChanged: EventEmitter<TabData[]> = new EventEmitter<TabData[]>();
  @Output() public tabSwitched: EventEmitter<{ index: number, refresh?: boolean }> = new EventEmitter<{ index: number, refresh?: boolean }>();

  public readonly faPlus: IconDefinition = faPlus;

  constructor() { }

  public onAddNewTab(): void {
    this.allTabs.push({});
    this.allTabsChanged.emit(this.allTabs);
    this.currentTabIndex = this.allTabs.length - 1;
    this.tabSwitched.emit({ index: this.currentTabIndex });
  }

  public getTabName(tab: TabData): string {
    return tab.location ? getName(tab.location) : null;
  }

  public onSwitchedToTab(index: number): void {
    this.currentTabIndex = index;
    this.tabSwitched.emit({ index: this.currentTabIndex, refresh: true });
  }

  public onCloseTab(index: number): void {
    this.allTabs = this.allTabs.filter((x, i) => index != i);
    index = [0, index - 1].reduce((p, c) => p > c ? p : c);
    this.allTabsChanged.emit(this.allTabs);
    this.tabSwitched.emit({ index: index });
  }
}

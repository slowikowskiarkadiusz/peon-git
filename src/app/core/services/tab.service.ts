import { Injectable } from '@angular/core';
import { TabData } from '../../home/tab-content/tab-content.component';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TabService {
  constructor(private localStorageService: LocalStorageService) { }

  public getTabDatas(): TabData[] {
    return this.localStorageService.get<TabData[]>('all-tabs', true);
  }

  public setTabDatas(value: TabData[]) {
    this.localStorageService.set('all-tabs', value, true);
  }

  public getCurrentTabDataIndex(): number {
    return this.localStorageService.get<number>('active-tab', true);
  }

  public setCurrentTabDataIndex(value: number) {
    this.localStorageService.set('active-tab', value, true);
  }

  public getCurrentGraphRow(): number {
    return this.localStorageService.get<number>('selected-graph-row');
  }

  public setCurrentGraphRow(value: number) {
    this.localStorageService.set('selected-graph-row', value);
  }

  public getCurrentChangeListRow(): number {
    return this.localStorageService.get<number>('selected-changelist-row');
  }

  public setCurrentChangeListRow(value: number) {
    this.localStorageService.set('selected-changelist-row', value);
  }
}

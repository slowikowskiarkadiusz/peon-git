import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';
import { ElectronService } from '../core/services';
import { LocalStorageService } from '../core/services/local-storage.service';
import { TabService } from '../core/services/tab.service';
import { CheckoutModalComponent } from './modals/checkout-modal/checkout-modal.component';
import { CherryPickModalComponent } from './modals/cherry-pick-modal/cherry-pick-modal.component';
import { CommitModalComponent } from './modals/commit-modal/commit-modal.component';
import { CreateBranchModalComponent } from './modals/create-branch-modal/create-branch-modal.component';
import { DeleteBranchModalComponent } from './modals/delete-branch-modal/delete-branch-modal.component';
import { ElectronableModalData } from './modals/electronable-modal-base/electronable-modal-base.component';
import { FetchModalComponent } from './modals/fetch-modal/fetch-modal.component';
import { MergeModalComponent } from './modals/merge-modal/merge-modal.component';
import { OutputModalComponent, OutputModalData } from './modals/output-modal/output-modal.component';
import { PullModalComponent } from './modals/pull-modal/pull-modal.component';
import { PushModalComponent } from './modals/push-modal/push-modal.component';
import { ResetModalComponent } from './modals/reset-modal/reset-modal.component';
import { TabData } from './tab-content/tab-content.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  public currentTab: TabData = null;
  public allTabs: TabData[] = [];
  public currentTabIndex: number = -1;

  public get windowHeight(): number {
    return document.documentElement.clientHeight;
  }

  constructor(
    private tabService: TabService,
    electronService: ElectronService,
    private dialog: MatDialog,
    private localStorageService: LocalStorageService) {
    this.allTabs = tabService.getTabDatas() ?? [];
    this.currentTabIndex = tabService.getCurrentTabDataIndex()
    this.currentTab = this.allTabs[this.currentTabIndex];

    electronService
      .registerOpeningModal()
      .subscribe(x => this.openModal(x));

    electronService
      .registerOpeningOutputModal()
      .subscribe(x => {
        this.openOutputModal(x)
      });
  }

  public ngAfterViewInit(): void {
    const currentModalData = this.localStorageService.get<ElectronableModalData>('current-modal');
    if (currentModalData)
      this.openModal(currentModalData);
  }

  public onAllTabsChanged(event: TabData[]): void {
    this.tabService.setTabDatas(event);
    this.allTabs = event;
  }

  public onTabDataChanged(event: TabData): void {
    this.currentTabIndex = this.tabService.getCurrentTabDataIndex()
    this.allTabs[this.currentTabIndex] = this.currentTab = event;
    this.onAllTabsChanged(this.allTabs);
  }

  public onTabSwitched(event: { index: number, refresh?: boolean }): void {
    this.tabService.setCurrentTabDataIndex(event.index);
    this.currentTabIndex = event.index;
    this.currentTab = this.allTabs[event.index];
    if (event.refresh) location.reload();
  }

  private openModal(value: ElectronableModalData): void {
    this.localStorageService.set<ElectronableModalData>('current-modal', value);

    this.makeDialog(value)
      .afterClosed()
      .pipe(take(1))
      .subscribe((preventReload) => {
        this.localStorageService.set<ElectronableModalData>('current-modal', null);
      });
  }

  private openOutputModal(value: OutputModalData): void {
    const dialog = this.dialog.open(OutputModalComponent, { data: value });
    dialog.afterClosed()
      .pipe(take(1))
      .subscribe((preventReload) => {
        if (!preventReload) location.reload();
      });

    setTimeout(() => window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'a' })), 1);
  }

  private makeDialog(value: ElectronableModalData) {
    switch (value.componentName) {
      case 'CommitModalComponent': return this.dialog.open(CommitModalComponent, { data: value });
      case 'PullModalComponent': return this.dialog.open(PullModalComponent, { data: value });
      case 'FetchModalComponent': return this.dialog.open(FetchModalComponent, { data: value });
      case 'PushModalComponent': return this.dialog.open(PushModalComponent, { data: value });
      case 'DeleteBranchModalComponent': return this.dialog.open(DeleteBranchModalComponent, { data: value });
      case 'CheckoutModalComponent': return this.dialog.open(CheckoutModalComponent, { data: value });
      case 'CreateBranchModalComponent': return this.dialog.open(CreateBranchModalComponent, { data: value });
      case 'MergeModalComponent': return this.dialog.open(MergeModalComponent, { data: value });
      case 'ResetModalComponent': return this.dialog.open(ResetModalComponent, { data: value });
      case 'CherryPickModalComponent': return this.dialog.open(CherryPickModalComponent, { data: value });
    }
  }
}

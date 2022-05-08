import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { HomeRoutingModule } from './home-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { TabBarComponent } from './tab-bar/tab-bar.component';
import { TabContentComponent } from './tab-content/tab-content.component';
import { RepoTabComponent } from './repo-tab/repo-tab.component';
import { NewTabComponent } from './new-tab/new-tab.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GitGraphComponent } from './git-graph/git-graph.component';
import { ChangesListComponent } from './changes-list/changes-list.component';
import { CommitInfoComponent } from './commit-info/commit-info.component';
import { CheckoutModalComponent } from './modals/checkout-modal/checkout-modal.component';
import { OutputModalComponent } from './modals/output-modal/output-modal.component';
import { ElectronableModalBaseComponent } from './modals/electronable-modal-base/electronable-modal-base.component';
import { CreateBranchModalComponent } from './modals/create-branch-modal/create-branch-modal.component';
import { DeleteBranchModalComponent } from './modals/delete-branch-modal/delete-branch-modal.component';
import { MergeModalComponent } from './modals/merge-modal/merge-modal.component';
import { CommitModalComponent } from './modals/commit-modal/commit-modal.component';
import { ResetModalComponent } from './modals/reset-modal/reset-modal.component';
import { PushModalComponent } from './modals/push-modal/push-modal.component';
import { FetchModalComponent } from './modals/fetch-modal/fetch-modal.component';
import { PullModalComponent } from './modals/pull-modal/pull-modal.component';
import { BtnComponent } from './btn/btn.component';
import { CherryPickModalComponent } from './modals/cherry-pick-modal/cherry-pick-modal.component';
import { CommitListComponent } from './commit-list/commit-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    TabBarComponent,
    TabContentComponent,
    RepoTabComponent,
    NewTabComponent,
    GitGraphComponent,
    ChangesListComponent,
    CommitInfoComponent,
    CheckoutModalComponent,
    OutputModalComponent,
    ElectronableModalBaseComponent,
    CreateBranchModalComponent,
    DeleteBranchModalComponent,
    MergeModalComponent,
    CommitModalComponent,
    ResetModalComponent,
    PushModalComponent,
    FetchModalComponent,
    PullModalComponent,
    BtnComponent,
    CherryPickModalComponent,
    CommitListComponent],
  imports: [
    CommonModule,
    SharedModule,
    HomeRoutingModule,
    FontAwesomeModule,
    MatDialogModule,
    BrowserAnimationsModule],
  providers: [DatePipe,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],
})
export class HomeModule { }

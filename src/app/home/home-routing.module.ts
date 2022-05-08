import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { CheckoutModalComponent } from './modals/checkout-modal/checkout-modal.component';
import { OutputModalComponent } from './modals/output-modal/output-modal.component';
import { CreateBranchModalComponent } from './modals/create-branch-modal/create-branch-modal.component';
import { DeleteBranchModalComponent } from './modals/delete-branch-modal/delete-branch-modal.component';
import { MergeModalComponent } from './modals/merge-modal/merge-modal.component';
import { ResetModalComponent } from './modals/reset-modal/reset-modal.component';
import { CommitModalComponent } from './modals/commit-modal/commit-modal.component';
import { PushModalComponent } from './modals/push-modal/push-modal.component';
import { FetchModalComponent } from './modals/fetch-modal/fetch-modal.component';
import { PullModalComponent } from './modals/pull-modal/pull-modal.component';
import { CherryPickModalComponent } from './modals/cherry-pick-modal/cherry-pick-modal.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'home/checkout-modal',
    component: CheckoutModalComponent
  },
  {
    path: 'home/commit-modal',
    component: CommitModalComponent
  },
  {
    path: 'home/create-branch-modal',
    component: CreateBranchModalComponent
  },
  {
    path: 'home/delete-branch-modal',
    component: DeleteBranchModalComponent
  },
  {
    path: 'home/merge-modal',
    component: MergeModalComponent
  },
  {
    path: 'home/reset-modal',
    component: ResetModalComponent
  },
  {
    path: 'home/push-modal',
    component: PushModalComponent
  },
  {
    path: 'home/fetch-modal',
    component: FetchModalComponent
  },
  {
    path: 'home/pull-modal',
    component: PullModalComponent
  },
  {
    path: 'home/cherry-pick-modal',
    component: CherryPickModalComponent
  },
  {
    path: 'home/output-modal',
    component: OutputModalComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

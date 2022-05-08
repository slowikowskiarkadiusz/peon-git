import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

type CheckoutTarget = 'branch' | 'commit';

export interface CheckoutModalData extends ElectronableModalData {
  predefTargetBranch?: string;
  predefTargetCommit?: string;
  brancheNames?: string[];
  commits?: { hash: string, message: string }[];
}

@Component({
  selector: 'app-checkout-modal',
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class CheckoutModalComponent extends ElectronableModalBaseComponent {
  public targetType: CheckoutTarget;
  public target: string;
  public force: boolean = false;
  public newBranch: boolean = false;
  public newBranchName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CheckoutModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private title: Title,
    private dialogRef: MatDialogRef<CheckoutModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`checkout @ ${this.gitService.repoName} - peon-git`);

    if (this.data.predefTargetBranch)
      this.targetType = 'branch';
    else if (this.data.predefTargetCommit)
      this.targetType = 'commit';
  }

  public onHelp(): void {

  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    // this.dialogRef.close();
    let target = this.data.predefTargetBranch ?? this.data.predefTargetCommit;
    let force = this.force ? '-f' : '';
    let branch = this.newBranch ? `-b ${this.newBranchName}` : '';
    this.electronService.runCmd(`git checkout ${branch} ${force} ${target}`, this.data.repoPath);
  }

  public onTargetTypeChanged(newTargetType: CheckoutTarget): void {
    this.targetType = newTargetType;
  }

  public onTargetChanged(selectEvent: Event & any): void {
    this.target = selectEvent.target.value;
  }

  public onForceCheckboxClicked(checkboxEvent: Event & any): void {
    this.force = checkboxEvent.target.checked;
  }

  public onNewBranchCheckboxClicked(checkboxEvent: Event & any): void {
    this.newBranch = checkboxEvent.target.checked;
  }

  public onNewBranchValueChanged(textEvent: Event & any): void {
    this.newBranchName = textEvent.target.value;
  }
}
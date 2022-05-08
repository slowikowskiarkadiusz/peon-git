import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

type TargetType = 'branch' | 'commit';

export interface CreateBranchModalData extends ElectronableModalData {
  predefTargetBranch?: string;
  predefTargetCommit?: string;
  brancheNames?: string[];
  commits?: { hash: string, message: string }[];
}

@Component({
  selector: 'app-create-branch-modal',
  templateUrl: './create-branch-modal.component.html',
  styleUrls: ['./create-branch-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class CreateBranchModalComponent extends ElectronableModalBaseComponent {
  public targetType: TargetType;
  public target: string;
  public name: string;
  public force: boolean;
  public checkout: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateBranchModalData,
    protected electronService: ElectronService,
    private title: Title,
    private gitService: GitService,
    private dialogRef: MatDialogRef<CreateBranchModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`create branch @ ${this.gitService.repoName} - peon-git`);

    if (this.data.predefTargetBranch) {
      this.targetType = 'branch';
    }
    else if (this.data.predefTargetCommit) {
      this.targetType = 'commit';
    }
  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    let target = this.data.predefTargetBranch ?? this.data.predefTargetCommit;
    let force = this.force ? '-f' : '';
    let checkout = this.checkout ? `git checkout ${this.name}` : '';
    this.electronService.runCmd(`git branch ${force} ${this.name} ${target};${checkout}`, this.data.repoPath);
  }

  public onTargetTypeChanged(newTargetType: TargetType): void {
    this.targetType = newTargetType;
  }

  public onTargetChanged(selectEvent: Event & any): void {
    this.target = selectEvent.target.value;
  }

  public onForceCheckboxClicked(checkboxEvent: Event & any): void {
    this.force = checkboxEvent.target.checked;
  }

  public onCheckoutCheckboxClicked(checkboxEvent: Event & any): void {
    this.checkout = checkboxEvent.target.checked;
  }

  public onNameValueChanged(textEvent: Event & any): void {
    this.name = textEvent.target.value;
  }
}

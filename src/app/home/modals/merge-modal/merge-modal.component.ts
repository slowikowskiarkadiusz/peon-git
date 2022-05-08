import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { WhatTheCommitService } from '../../../core/services/what-the-commit.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

type CheckoutTarget = 'branch' | 'commit';

export interface MergeModalData extends ElectronableModalData {
  predefTargetBranch?: string;
  predefTargetCommit?: string;
  brancheNames?: string[];
  commits?: { hash: string, message: string }[];
}

@Component({
  selector: 'app-merge-modal',
  templateUrl: './merge-modal.component.html',
  styleUrls: ['./merge-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class MergeModalComponent extends ElectronableModalBaseComponent {
  public targetType: CheckoutTarget;
  public target: string;
  public squash: boolean = false;
  public noFastForward: boolean = false;
  public fastForwardOnly: boolean = false;
  public noCommit: boolean = false;
  public commit: boolean = false;
  public commitMessage: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MergeModalData,
    protected electronService: ElectronService,
    private whatTheCommitService: WhatTheCommitService,
    private gitService: GitService,
    private title: Title,
    private dialogRef: MatDialogRef<MergeModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`merge @ ${this.gitService.repoName} - peon-git`);

    if (this.data.predefTargetBranch)
      this.targetType = 'branch';
    else if (this.data.predefTargetCommit)
      this.targetType = 'commit';

    this.whatTheCommitService
      .getMessage()
      .subscribe(x => this.commitMessage = x);
  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    let target = this.data.predefTargetBranch ?? this.data.predefTargetCommit;
    let commit = this.commit ? '--commit' : (this.noCommit ? '--no-commit' : '');
    commit = this.commit ? `${commit} -m ${this.commitMessage}` : commit;
    let ff = this.fastForwardOnly ? '--ff-only' : (this.noFastForward ? '--no-ff' : '');
    this.electronService.runCmd(`git merge ${ff} ${target} ${commit}`, this.data.repoPath);
  }

  public onTargetTypeChanged(newTargetType: CheckoutTarget): void {
    this.targetType = newTargetType;
  }

  public onTargetChanged(selectEvent: Event & any): void {
    this.target = selectEvent.target.value;
  }

  public onNoFastForwardCheckboxClicked(checkboxEvent: Event & any): void {
    this.noFastForward = checkboxEvent.target.checked;
    this.fastForwardOnly = false;
  }

  public onFastForwardOnlyCheckboxClicked(checkboxEvent: Event & any): void {
    this.fastForwardOnly = checkboxEvent.target.checked;
    this.noFastForward = false;
  }

  public onNoCommitCheckboxClicked(checkboxEvent: Event & any): void {
    this.noCommit = checkboxEvent.target.checked;
    this.commit = false;
  }

  public onCommitCheckboxClicked(checkboxEvent: Event & any): void {
    this.commit = checkboxEvent.target.checked;
    this.noCommit = false;
  }

  public onCommitMessageValueChanged(textEvent: Event & any): void {
    this.commitMessage = textEvent.target.value;
  }
}
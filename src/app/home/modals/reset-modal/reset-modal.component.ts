import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { Branch } from '../../../shared/git-graph.generator';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

type ResetType = 'soft' | 'mixed' | 'hard';
type ResetTargetType = 'branch' | 'commit';

export interface ResetModalData extends ElectronableModalData {
  predefTargetBranch?: string;
  predefTargetCommit?: string;
  brancheNames?: string[];
  commits?: { hash: string, message: string }[];
  currentBranch: Branch;
}

@Component({
  selector: 'app-reset-modal',
  templateUrl: './reset-modal.component.html',
  styleUrls: ['./reset-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class ResetModalComponent extends ElectronableModalBaseComponent {
  public resetType: ResetType = 'mixed';
  public targetType: ResetTargetType;
  public target: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ResetModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private title: Title,
    private dialogRef: MatDialogRef<ResetModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`reset @ ${this.gitService.repoName} - peon-git`);

    if (this.data.predefTargetBranch)
      this.targetType = 'branch';
    else if (this.data.predefTargetCommit)
      this.targetType = 'commit';

    this.target = this.data.predefTargetBranch ?? this.data.predefTargetCommit;
  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    this.electronService.runCmd(`git reset --${this.resetType} ${this.target}`, this.data.repoPath);
  }

  public onResetypeChanged(newResettype: ResetType): void {
    this.resetType = newResettype;
  }

  public onTargetTypeChanged(newTargetType: ResetTargetType): void {
    this.targetType = newTargetType;
  }

  public onTargetChanged(selectEvent: Event & any): void {
    this.target = selectEvent.target.value;
  }
}
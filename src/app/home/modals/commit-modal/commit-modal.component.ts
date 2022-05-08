import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { FileInfo, GitService } from '../../../core/services/electron/git.service';
import { WhatTheCommitService } from '../../../core/services/what-the-commit.service';
import { Branch } from '../../../shared/git-graph.generator';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

export interface CommitModalData extends ElectronableModalData {
  targetBranch: Branch;
}

@Component({
  selector: 'app-commit-modal',
  templateUrl: './commit-modal.component.html',
  styleUrls: ['./commit-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class CommitModalComponent extends ElectronableModalBaseComponent {
  public amendLastCommit: boolean;
  public commitMessage: string;
  public fileInfos: FileInfo[] = [];

  private filePathsToAdd: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CommitModalData,
    protected electronService: ElectronService,
    private whatTheCommitService: WhatTheCommitService,
    private gitService: GitService,
    private title: Title,
    private dialogRef: MatDialogRef<CommitModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`commit @ ${this.gitService.repoName} - peon-git`);

    this.whatTheCommitService
      .getMessage()
      .subscribe(x => this.commitMessage = x);

    this.gitService.getWorkingTree().then(x => this.fileInfos = x);
  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    this.electronService.runCmd(`git add ${this.filePathsToAdd.join(' ')}; git commit -m "${this.commitMessage}"`, this.data.repoPath);
  }

  public onAmendLastCommitCheckboxClicked(checkboxEvent: Event & any): void {
    this.amendLastCommit = checkboxEvent.target.checked;
  }

  public onCommitMessageValueChanged(textEvent: Event & any): void {
    this.commitMessage = textEvent.target.value;
  }

  public onCheckedChange(fileInfos: FileInfo[]): void {
    this.filePathsToAdd = fileInfos.map(x => x.filePath);
  }
}
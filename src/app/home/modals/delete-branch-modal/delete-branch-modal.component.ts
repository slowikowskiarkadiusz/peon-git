import { Component, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { Branch } from '../../../shared/git-graph.generator';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

export interface DeleteBranchModalData extends ElectronableModalData {
  predefBranch?: Branch;
  branches?: Branch[];
}

@Component({
  selector: 'app-delete-branch-modal',
  templateUrl: './delete-branch-modal.component.html',
  styleUrls: ['./delete-branch-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class DeleteBranchModalComponent extends ElectronableModalBaseComponent {
  public target: Branch;
  public force: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeleteBranchModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private title: Title,
    private dialogRef: MatDialogRef<DeleteBranchModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

this.title.setTitle(`delete @ ${this.gitService.repoName} - peon-git`);

    this.target = this.data.predefBranch ?? this.data.branches[0];
  }

  public get branchNames(): string[] {
    return this.data.branches.map(x => x.name);
  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    if (this.target.isRemote) {
      let name: string = this.target.name.substring(this.target.name.indexOf('/') + 1);
      let remote: string = this.target.name.substring(0, this.target.name.indexOf('/'));
      this.electronService.runCmd(`git push ${remote} --delete ${name}`, this.data.repoPath);
    }
    else {
      let name = this.target.name;
      let force: string = this.force ? '-f' : '';
      this.electronService.runCmd(`git branch -d ${force} ${name}`, this.data.repoPath);
    }
  }

  public onTargetChanged(selectEvent: Event & any): void {
    console.log(selectEvent);
    console.log(selectEvent.target.value);
    this.target = selectEvent.target.value;
  }

  public onForceCheckboxClicked(checkboxEvent: Event & any): void {
    this.force = checkboxEvent.target.checked;
  }
}

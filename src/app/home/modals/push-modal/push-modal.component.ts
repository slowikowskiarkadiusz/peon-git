import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

export interface PushModalData extends ElectronableModalData {
  predefTargetBranch?: string;
  brancheNames?: string[];
}

@Component({
  selector: 'app-push-modal',
  templateUrl: './push-modal.component.html',
  styleUrls: ['./push-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class PushModalComponent extends ElectronableModalBaseComponent {
  public branch: string;
  public remotes: string[] = [];
  public remote: string;
  public forceWithLease: boolean = false;
  public force: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PushModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private localStorageService: LocalStorageService,
    private title: Title,
    private dialogRef: MatDialogRef<PushModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

this.title.setTitle(`push @ ${this.gitService.repoName} - peon-git`);

    this.gitService.remotes().then(x => {
      this.remotes = x;
      let cachedRemote = localStorageService.get('remote') as string;
      console.log("psuh", cachedRemote);
      this.remote = x.includes(cachedRemote) ? cachedRemote : x[0];
    });

    this.branch = this.data.predefTargetBranch;
  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    let force = this.force ? '--force' : (this.forceWithLease ? '--force-with-lease' : '');
    this.electronService.runCmd(`git push ${force} ${this.remote} ${this.branch}`, this.data.repoPath);
  }

  public onBranchChanged(selectEvent: Event & any): void {
    this.branch = selectEvent.target.value;
  }

  public onRemoteChanged(selectEvent: Event & any): void {
    this.remote = selectEvent.target.value;
    this.localStorageService.set('remote', this.remote);
  }

  public onForceWithLeaseCheckboxClicked(checkboxEvent: Event & any): void {
    this.forceWithLease = checkboxEvent.target.checked;
    this.force = false;
  }

  public onForceCheckboxClicked(checkboxEvent: Event & any): void {
    this.force = checkboxEvent.target.checked;
    this.forceWithLease = false;
  }
}
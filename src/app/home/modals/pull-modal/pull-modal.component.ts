import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

type PullTarget = 'remote' | '--all';

export interface PullModalData extends ElectronableModalData {
  brancheNames?: string[];
}

@Component({
  selector: 'app-pull-modal',
  templateUrl: './pull-modal.component.html',
  styleUrls: ['./pull-modal.component.scss']
})
export class PullModalComponent extends ElectronableModalBaseComponent {
  public targetType: PullTarget;
  public remotes: string[] = [];
  public remote: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PullModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private localStorageService: LocalStorageService,
    private title: Title,
    private dialogRef: MatDialogRef<PullModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`pull @ ${this.gitService.repoName} - peon-git`);

    this.gitService.remotes().then(x => {
      this.remotes = x;
      let cachedRemote = localStorageService.get('remote') as string;
      this.remote = x.includes(cachedRemote) ? cachedRemote : x[0];
    });

    this.targetType = '--all';
  }

  public onHelp(): void {

  }

  public onCancel(): void {
    //
  }

  public onSubmit(): void {
    this.electronService.runCmd(`git pull ${this.targetType == 'remote' ? this.remote : this.targetType}`, this.data.repoPath);
  }

  public onRemoteChanged(selectEvent: Event & any): void {
    this.remote = selectEvent.target.value;
    this.localStorageService.set('remote', this.remote);
  }

  public onTargetTypeChanged(newTargetType: PullTarget): void {
    this.targetType = newTargetType;
  }
}
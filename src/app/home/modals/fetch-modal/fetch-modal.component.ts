import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services/electron/electron.service';
import { GitService } from '../../../core/services/electron/git.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

type FetchTarget = 'remote' | '--all';

export interface FetchModalData extends ElectronableModalData {
  brancheNames?: string[];
}

@Component({
  selector: 'app-fetch-modal',
  templateUrl: './fetch-modal.component.html',
  styleUrls: ['./fetch-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class FetchModalComponent extends ElectronableModalBaseComponent {
  public targetType: FetchTarget;
  public remotes: string[] = [];
  public remote: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FetchModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private localStorageService: LocalStorageService,
    private title: Title,
    private dialogRef: MatDialogRef<FetchModalComponent>) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.title.setTitle(`fetch @ ${this.gitService.repoName} - peon-git`);

    this.gitService.repoPath = this.data.repoPath;

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
    this.electronService.runCmd(`git fetch ${this.targetType == 'remote' ? this.remote : this.targetType}`, this.data.repoPath);
  }

  public onRemoteChanged(selectEvent: Event & any): void {
    this.remote = selectEvent.target.value;
    this.localStorageService.set('remote', this.remote);
  }

  public onTargetTypeChanged(newTargetType: FetchTarget): void {
    this.targetType = newTargetType;
  }
}
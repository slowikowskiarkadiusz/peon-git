import { ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { CommandOptions } from '../../../../../app/main';
import { ElectronService } from '../../../core/services';
import { Commit, ContextMenuItem, FileInfo, GitService } from '../../../core/services/electron/git.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { all, ceItem, none, shortHash, startsWith } from '../../../shared/utils.helper';
import { CommitListContextMenuMsg } from '../../commit-list/commit-list.component';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

export interface CherryPickModalData extends ElectronableModalData {
  commits: Commit[];
}

@Component({
  selector: 'app-cherry-pick-modal',
  templateUrl: './cherry-pick-modal.component.html',
  styleUrls: ['./cherry-pick-modal.component.scss', '../electronable-modal-base/electronable-modal-base.component.scss']
})
export class CherryPickModalComponent extends ElectronableModalBaseComponent implements OnDestroy {
  public fileInfos: FileInfo[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CherryPickModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private title: Title,
    private localStorageService: LocalStorageService,
    private dialogRef: MatDialogRef<CherryPickModalComponent>,
    private changeRef: ChangeDetectorRef) {
    super(electronService, dialogRef);
    this.baseData = data;

    this.data.commits.reverse();
    this.title.setTitle(`cherry-pick @ ${this.gitService.repoName} - peon-git`);
    if (this.mergeFixingMode)
      this.gitService
        .getWorkingTree()
        .then(x => this.fileInfos = x);
    else
      this.gitService
        .diff(this.data.commits[0].hash)
        .then(x => this.fileInfos = x);
  }

  public ngOnDestroy(): void {
    this.resetCache();
  }

  public get currentCommitTarget(): number {
    return this.localStorageService.get('current-cherry-picking-commit-target') as number ?? 0;
  }

  private set currentCommitTarget(newValue: number) {
    this.localStorageService.set('current-cherry-picking-commit-target', newValue);
  }

  public get mergeFixingMode(): boolean {
    return this.localStorageService.get('cherry-picking-merge-fixing-mode') as boolean;
  }

  private set mergeFixingMode(newValue: boolean) {
    this.localStorageService.set('cherry-picking-merge-fixing-mode', newValue);
  }

  public get isCherryPickingInProgress(): boolean {
    return this.localStorageService.get('is-cherry-picking-in-progress') as boolean;
  }

  private set isCherryPickingInProgress(newValue: boolean) {
    this.localStorageService.set('is-cherry-picking-in-progress', newValue);
  }

  public get tableStyle(): string {
    return `grid-template-rows: fill fill fill;`;
  }

  public onSubmit(): void {
    this.resetCache();
  }

  public onCancel(): void {
    // this.electronService.runCmd(`git cherry-pick ${this.data.commits[this.currentCommitTarget].hash}`, this.gitService.repoPath);
    this.resetCache();
  }

  public onGraphContextMenu(msg: CommitListContextMenuMsg): void {
    let items: ContextMenuItem[] = [];

    let copyNestedItems: ContextMenuItem[] = [];
    if (msg.branch?.name) copyNestedItems.push({ label: '🕊 ...the branch name', action: 'copy', actionContent: msg.branch?.name, nested: [] });
    if (msg.commits.length > 0) {
      copyNestedItems.push({ label: '🌱 ...the commit hash', action: 'copy', actionContent: msg.commits.map(x => x.hash).join('\n'), nested: [] });
      copyNestedItems.push({ label: '🌱 ...the commit author name', action: 'copy', actionContent: msg.commits.map(x => x.author).join('\n'), nested: [] });
      copyNestedItems.push({ label: '🌱 ...the commit message', action: 'copy', actionContent: msg.commits.map(x => x.message).join('\n'), nested: [] });
    }
    if (copyNestedItems.length > 0)
      items.push({ label: `📃 Copy...`, action: 'group', actionContent: '', nested: copyNestedItems });

    this.electronService.setContextMenuCommands(items);
  }

  public async onChangesListContextMenu(fileInfos: FileInfo[]): Promise<void> {
    let items: ContextMenuItem[] = [];

    if (this.mergeFixingMode) {
      if (all(fileInfos, x => x.isTracked)) { // File not in index
        if (none(fileInfos, x => x.commitHash?.length > 0)) { // Working tree
          items.push(ceItem(`⏲ Reset changes`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git reset -- ${fileInfo.filePath}; git checkout HEAD -- ${fileInfo.filePath}`).join('; ') })));
        }

        items.push(ceItem(`💀 Remove from index`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git rm --cached ${fileInfo.filePath}`).join('; ') })));
      }
      else if (none(fileInfos, x => x.isTracked)) { // File in index
        items.push(ceItem(`👽 Add to index`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git add ${fileInfo.filePath}`).join('; ') })));
        items.push(ceItem(`🪦 Remove file`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git clean -f -d ${fileInfo.filePath}`).join('; ') })));
      }

      if (all(fileInfos, x => x.nameStatus === 'U')) {
        items.push(ceItem(`👇 Resolve using our changes (HEAD)`, 'run-cmd', this.makeOptions({ actionContent: await this.resolvingFileCmd(fileInfos[0].filePath, 'ours') })));
        items.push(ceItem(`👈 Resolve using their changes (MERGE_HEAD)`, 'run-cmd', this.makeOptions({ actionContent: await this.resolvingFileCmd(fileInfos[0].filePath, 'theirs') })));
        items.push(ceItem(`🤢 Open in mergetool`, 'run-cmd', this.makeOptions({ actionContent: `git mergetool --no-prompt ${fileInfos[0].commitHash?.length > 0 ? fileInfos[0].commitHash : 'HEAD'} -- ${fileInfos[0].filePath}` })));
      }

      items.push(ceItem(`🤮 Open in difftool`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git difftool --no-prompt ${fileInfo.commitHash?.length > 0 ? fileInfo.commitHash : 'HEAD'} -- ${fileInfo.filePath}`).join('; ') })));
      items.push(ceItem(`🛀 Show in folder`, 'show-in-folder', this.makeOptions({ actionContent: fileInfos[0].filePath })));
    }

    let copyNestedItems: ContextMenuItem[] = [];
    copyNestedItems.push(ceItem('🐾 ...the file path', 'copy', this.makeOptions({ actionContent: fileInfos.map(fileInfo => fileInfo.filePath).join('\n') })));
    if (copyNestedItems.length > 0)
      items.push(ceItem(`📃 Copy...`, 'group', { nested: copyNestedItems }));

    this.electronService.setContextMenuCommands(items);
  }

  private makeOptions(options: { actionContent?: string, nested?: ContextMenuItem[], modalData?: ElectronableModalData, commandOptions?: CommandOptions }): { path?: string, actionContent?: string, nested?: ContextMenuItem[], modalData?: ElectronableModalData, commandOptions?: CommandOptions } {
    return {
      path: this.gitService.repoPath,
      actionContent: options.actionContent,
      nested: options.nested,
      modalData: options.modalData,
      commandOptions: options.commandOptions,
    }
  }

  private async resolvingFileCmd(filePath: string, whoseChanges: 'ours' | 'theirs'): Promise<string> {
    const stage = whoseChanges === 'ours' ? '2' : '3';
    const res = (await this.gitService.lsFiles(filePath)).filter(x => x.stage === stage)[0];
    const a = res ?
      `git checkout-index -f --stage=${stage} -- ${filePath}; git update-index --replace --cacheinfo ${res.mode},${res.hash},"${res.filePath}"` :
      `git rm ${filePath}; git clean -f -d ${filePath}`;
    return a;
  }

  public async onCommitFocusChange(commit: Commit): Promise<void> {
    if (!this.mergeFixingMode)
      this.fileInfos = await this.gitService.diff(commit.hash);
  }

  public onRunNext(): void {
    // TODO probably should somehow secure that part against being run before the repo path is supplied

    this.isCherryPickingInProgress = true;
    this.electronService.runCmd(`git cherry-pick ${this.data.commits[this.currentCommitTarget].hash}`, this.gitService.repoPath, { preventReload: true });
    this.mergeFixingMode = false;

    this.electronService.openOutputModal.subscribe(async value => {
      if (startsWith(value?.error?.message, 'Command failed: git cherry-pick')) {
        this.mergeFixingMode = true;
      }

      if (this.mergeFixingMode) {
        this.gitService.getWorkingTree().then(x => {
          this.fileInfos = x;
          this.changeRef.markForCheck();
        });
      }
      else {
        this.onCommitFocusChange(this.data.commits[this.currentCommitTarget]);
        this.currentCommitTarget++;
        this.isCherryPickingInProgress = false;
      }
    });
  }

  public onRunRest(): void {

  }

  private resetCache(): void {
    this.currentCommitTarget = 0;
    this.mergeFixingMode = false;
  }
}

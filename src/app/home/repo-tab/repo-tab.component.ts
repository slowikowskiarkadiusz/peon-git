import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommandOptions } from '../../../../app/main';
import { ElectronService } from '../../core/services';
import { Commit, ContextMenuItem, ContextMenuItemActionType, FileInfo, GitService } from '../../core/services/electron/git.service';
import { Branch } from '../../shared/git-graph.generator';
import { all, ceItem, none, shortHash } from '../../shared/utils.helper';
import { GitGraphContextMenuMsg } from '../git-graph/git-graph.component';
import { CheckoutModalData } from '../modals/checkout-modal/checkout-modal.component';
import { CherryPickModalData } from '../modals/cherry-pick-modal/cherry-pick-modal.component';
import { CommitModalData } from '../modals/commit-modal/commit-modal.component';
import { CreateBranchModalData } from '../modals/create-branch-modal/create-branch-modal.component';
import { DeleteBranchModalData } from '../modals/delete-branch-modal/delete-branch-modal.component';
import { ElectronableModalData } from '../modals/electronable-modal-base/electronable-modal-base.component';
import { FetchModalData } from '../modals/fetch-modal/fetch-modal.component';
import { MergeModalData } from '../modals/merge-modal/merge-modal.component';
import { PullModalData } from '../modals/pull-modal/pull-modal.component';
import { PushModalData } from '../modals/push-modal/push-modal.component';
import { ResetModalData } from '../modals/reset-modal/reset-modal.component';
import { TabData } from '../tab-content/tab-content.component';

// TODO: change home module to something else (like, repository-view-module)

@Component({
  selector: 'app-repo-tab',
  templateUrl: './repo-tab.component.html',
  styleUrls: ['./repo-tab.component.scss']
})
export class RepoTabComponent implements OnInit {
  @Input() public tabData: TabData | null;

  public isDoneCalculating: boolean = false;
  public currentCommit: string = null;
  public currentBranch: Branch = null;
  public commits: Commit[] = [];
  public branches: Branch[] = [];
  public fileInfos: FileInfo[] = [];
  public repoName: string = null;
  public isWorkingTree: boolean = false;

  public get tableStyle(): string {
    return `display: grid; grid-template-rows: 50% 50%;`;
  }

  constructor(
    private gitService: GitService,
    private electronService: ElectronService,
    private title: Title) {
    // this.electronService.registerOutputEvents();
    // this.electronService.out.subscribe(x => location.reload());
    // this.electronService.err.subscribe(x => location.reload());
  }

  async ngOnInit(): Promise<void> {
    this.gitService.repoPath = this.tabData.location;
    this.repoName = this.gitService.repoName;
    this.title.setTitle(this.repoName);
    this.branches = await this.gitService.branches();
    const branchCommits = await Promise.all(this.branches.map(x => x.name).map((branch: string) => this.gitService.commits(branch)));

    this.commits = await this.gitService.commits();
    this.isWorkingTree = (await this.gitService.getWorkingTree()).length > 0;
    this.currentCommit = await this.gitService.currentCommitHash();
    this.currentBranch = this.branches.filter(x => x.isCurrent)[0];
    this.branches = this.branches.map((branch, index) => {
      return {
        name: branch.name,
        commits: branchCommits[index],
        isCurrent: branch.isCurrent,
        isRemote: branch.isRemote,
      } as Branch;
    });
  }

  public onGraphContextMenu(msg: GitGraphContextMenuMsg): void {
    let items: ContextMenuItem[] = [];
    let target: string = msg.branch?.name ?? shortHash(msg.commits[0].hash);

    if (msg.commits[0].hash === '') { // Working tree pseudo-commit
      items.push(ceItem(`🎒 Commit changes`, 'open-modal', this.makeOptions({ modalData: this.commit() })));
    }
    else { // Regular commit
      // items.push(ceItem(`🚨 Pull`, 'open-modal', '/home/pull-modal', this.gitService.repoPath, this.pull()));
      items.push(ceItem('🐶 Fetch', 'open-modal', this.makeOptions({ modalData: this.fetch() })));

      if (msg.branchesAtCommit?.length > 0) {
        let pushItems: ContextMenuItem[] = [];
        msg.branchesAtCommit.filter(b => !b.isRemote).forEach(b => pushItems.push(ceItem(`😖 ${b.name}`, 'open-modal', this.makeOptions({ modalData: this.push(b.name) }))));
        items.push(ceItem(`😤 Push...`, 'group', this.makeOptions({ nested: pushItems })));

        let deleteItems: ContextMenuItem[] = [];
        msg.branchesAtCommit.forEach(b => deleteItems.push(ceItem(`${b.isRemote ? '🚚' : '🚛'} ${b.name}`, 'open-modal', this.makeOptions({ modalData: this.deleteBranch(b) }))));
        items.push(ceItem(`🗑 Delete...`, 'group', this.makeOptions({ nested: deleteItems })));
      }

      if (msg.commits.length === 1) {
        const defOptions = { branch: msg.branch, commit: msg.commits[0] };

        let checkoutestedCheckouts: ContextMenuItem[] = [];
        checkoutestedCheckouts.push(ceItem(`🍁 ${shortHash(msg.commits[0].hash)}`, 'open-modal', this.makeOptions({ modalData: this.checkout({ commit: msg.commits[0] }) })));
        msg.branchesAtCommit.filter(b => !b.isRemote).forEach(b => checkoutestedCheckouts.push(ceItem(`🍂 ${b.name}`, 'open-modal', this.makeOptions({ modalData: this.checkout({ branch: b }) }))));
        items.push(ceItem('🧳 Checkout to...', 'group', this.makeOptions({ nested: checkoutestedCheckouts })));

        items.push(ceItem(`🍼 Create a new branch on '${target}'`, 'open-modal', this.makeOptions({ modalData: this.createBranch(defOptions) })));
        items.push(ceItem(`💒 Merge '${target}' into '${this.currentBranch.name}'`, 'open-modal', this.makeOptions({ modalData: this.merge(defOptions) })));

        if (this.currentBranch.name) {
          items.push(ceItem(`⏱ Reset '${this.currentBranch.name}' to '${target}'`, 'open-modal', this.makeOptions({ modalData: this.reset(defOptions) })));
        }
      }

      const cherrypickLabel = `🍒 Cherry-pick ${msg.commits.length === 1 ? shortHash(msg.commits[0].hash) : `${shortHash(msg.commits[msg.commits.length - 1].hash)}...${shortHash(msg.commits[0].hash)}`}`;
      items.push(ceItem(cherrypickLabel, 'open-modal', this.makeOptions({ modalData: this.cherrypick(msg.commits) })));

      let copyNestedItems: ContextMenuItem[] = [];
      if (msg.branch?.name) copyNestedItems.push({ label: '🕊 ...the branch name', action: 'copy', actionContent: msg.branch?.name, nested: [] });
      if (msg.commits.length > 0) {
        copyNestedItems.push({ label: '🌱 ...the commit hash', action: 'copy', actionContent: msg.commits.map(x => x.hash).join('\n'), nested: [] });
        copyNestedItems.push({ label: '🌱 ...the commit author name', action: 'copy', actionContent: msg.commits.map(x => x.author).join('\n'), nested: [] });
        copyNestedItems.push({ label: '🌱 ...the commit message', action: 'copy', actionContent: msg.commits.map(x => x.message).join('\n'), nested: [] });
      }
      if (copyNestedItems.length > 0)
        items.push({ label: `📃 Copy...`, action: 'group', actionContent: '', nested: copyNestedItems });
    }

    this.electronService.setContextMenuCommands(items);
  }

  public async onChangesListContextMenu(fileInfos: FileInfo[]): Promise<void> {
    let items: ContextMenuItem[] = [];
    // items.push(ceItem(`ls-files`, 'run-cmd', `git ls-files -u -t -- ${fileInfos[0].filePath.substring(0, fileInfos[0].filePath.lastIndexOf('/'))}`, this.gitService.repoPath));

    if (all(fileInfos, x => x.isTracked)) { // File not in index
      if (all(fileInfos, x => x.commitHash?.length > 0)) { // Not working tree
        const hash = shortHash(fileInfos[0].commitHash);
        items.push(ceItem(`⏱ Revert to this revision ('${hash}')`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git checkout ${fileInfo.commitHash} -- ${fileInfo.filePath}`).join('; ') })));
        items.push(ceItem(`🕰 Revert to parent revision ('${hash}~1')`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git checkout ${fileInfo.commitHash}~1 -- ${fileInfo.filePath}`).join('; ') })));
      }

      else if (none(fileInfos, x => x.commitHash?.length > 0)) { // Working tree
        items.push(ceItem(`⏲ Reset changes`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git reset -- ${fileInfo.filePath}; git checkout HEAD -- ${fileInfo.filePath}`).join('; ') })));
      }

      items.push(ceItem(`💀 Remove from index`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git rm --cached ${fileInfo.filePath}`).join('; ') })));
    }
    else if (none(fileInfos, x => x.isTracked)) { // File in index
      items.push(ceItem(`👽 Add to index`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git add ${fileInfo.filePath}`).join('; ') })));
      items.push(ceItem(`🪦 Remove file`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git clean -f -d ${fileInfo.filePath}`).join('; ') })));
    }

    if (all(fileInfos, x => x.nameStatus === 'U')) {
      // items.push(ceItem(`👇 Resolve using our changes (HEAD)`, 'run-cmd', fileInfos.map(fileInfo => `git checkout --ours ${fileInfo.filePath}`).join('; '), {path: this.gitService.repoPath}));
      // items.push(ceItem(`👈 Resolve using their changes (MERGE_HEAD)`, 'run-cmd', fileInfos.map(fileInfo => `git checkout --theirs ${fileInfo.filePath}`).join('; '), {path: this.gitService.repoPath}));

      items.push(ceItem(`👇 Resolve using our changes (HEAD)`, 'run-cmd', this.makeOptions({ actionContent: await this.resolvingFileCmd(fileInfos[0].filePath, 'ours') })));
      items.push(ceItem(`👈 Resolve using their changes (MERGE_HEAD)`, 'run-cmd', this.makeOptions({ actionContent: await this.resolvingFileCmd(fileInfos[0].filePath, 'theirs') })));

      items.push(ceItem(`🤢 Open in mergetool`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git mergetool --no-prompt ${fileInfo.commitHash?.length > 0 ? fileInfo.commitHash : 'HEAD'} -- ${fileInfo.filePath}`).join('; '), commandOptions: { preventReload: true } })));
    }

    items.push(ceItem(`🤮 Open in difftool`, 'run-cmd', this.makeOptions({ actionContent: fileInfos.map(fileInfo => `git difftool --no-prompt ${fileInfo.commitHash?.length > 0 ? fileInfo.commitHash : 'HEAD'} -- ${fileInfo.filePath}`).join('; '), commandOptions: { preventReload: true } })));
    items.push(ceItem(`🛀 Show in folder`, 'show-in-folder', this.makeOptions({ actionContent: fileInfos[0].filePath })));

    let copyNestedItems: ContextMenuItem[] = [];
    copyNestedItems.push(ceItem('🐾 the file path', 'copy', { actionContent: fileInfos.map(fileInfo => fileInfo.filePath).join('\n') }))
    if (copyNestedItems.length > 0) items.push(ceItem(`📃 Copy...`, 'group', this.makeOptions({ nested: copyNestedItems })));

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
    this.fileInfos = await (commit.hash ? this.gitService.diff(commit.hash) : this.gitService.getWorkingTree());
  }

  private commit(): CommitModalData {
    return {
      componentName: 'CommitModalComponent',
      targetBranch: this.currentBranch,
      repoPath: this.gitService.repoPath,
    };
  }

  private pull(): PullModalData {
    return {
      componentName: 'PullModalComponent',
      brancheNames: this.branches.map(x => x.name),
      repoPath: this.gitService.repoPath,
    };
  }

  private fetch(): FetchModalData {
    return {
      componentName: 'FetchModalComponent',
      brancheNames: this.branches.map(x => x.name),
      repoPath: this.gitService.repoPath,
    };
  }

  private push(branch: string): PushModalData {
    return {
      componentName: 'PushModalComponent',
      predefTargetBranch: branch,
      brancheNames: this.branches.map(x => x.name),
      repoPath: this.gitService.repoPath,
    };
  }

  private deleteBranch(branch: Branch): DeleteBranchModalData {
    return {
      componentName: 'DeleteBranchModalComponent',
      predefBranch: branch,
      branches: this.branches,
      repoPath: this.gitService.repoPath,
    };
  }

  private checkout(options: { branch?: Branch, commit?: Commit }): CheckoutModalData {
    return {
      componentName: 'CheckoutModalComponent',
      predefTargetBranch: options.branch?.name,
      predefTargetCommit: options.commit?.hash,
      brancheNames: this.branches.map(x => x.name),
      commits: this.commits.map(c => { return { hash: c.hash, message: c.message }; }),
      repoPath: this.gitService.repoPath,
    };
  }

  private createBranch(options: { branch?: Branch, commit?: Commit }): CreateBranchModalData {
    return {
      componentName: 'CreateBranchModalComponent',
      predefTargetBranch: options.branch?.name ?? null,
      predefTargetCommit: !options.branch?.name ? options.commit.hash : null,
      brancheNames: this.branches.map(x => x.name),
      commits: this.commits.map(c => { return { hash: c.hash, message: c.message }; }),
      repoPath: this.gitService.repoPath,
    };
  }

  private merge(options: { branch?: Branch, commit?: Commit }): MergeModalData {
    return {
      componentName: 'MergeModalComponent',
      predefTargetBranch: options.branch?.name ?? null,
      predefTargetCommit: !options.branch?.name ? options.commit.hash : null,
      brancheNames: this.branches.map(x => x.name),
      commits: this.commits.map(c => { return { hash: c.hash, message: c.message }; }),
      repoPath: this.gitService.repoPath,
    };
  }

  private reset(options: { branch?: Branch, commit?: Commit }): ResetModalData {
    return {
      componentName: 'ResetModalComponent',
      predefTargetBranch: options.branch?.name ?? null,
      predefTargetCommit: !options.branch?.name ? options.commit.hash : null,
      brancheNames: this.branches.map(x => x.name),
      commits: this.commits.map(c => { return { hash: c.hash, message: c.message }; }),
      currentBranch: this.currentBranch,
      repoPath: this.gitService.repoPath,
    };
  }

  private cherrypick(commits: Commit[]): CherryPickModalData {
    return {
      componentName: 'CherryPickModalComponent',
      commits: commits,
      repoPath: this.gitService.repoPath
    }
  }
}
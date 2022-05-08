import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { Branch } from '../../../shared/git-graph.generator';

@Injectable({
  providedIn: 'root'
})
export class GitService {
  public repoPath?: string;
  private readonly ipcRenderer: typeof ipcRenderer;
  private readonly webFrame: typeof webFrame;
  private readonly childProcess: typeof childProcess;
  private readonly fs: typeof fs;

  private allCommits: Commit[];

  constructor() {
    if (!!(window && window.process && window.process.type)) { // isElectron
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  public async setupRepo(): Promise<void> {
    await this.run('git config --global status.showUntrackedFiles all')
  }

  public get repoName(): string | null {
    if (this.repoPath) {
      let lastBackward = this.repoPath.lastIndexOf('\\');
      let lastForward = this.repoPath.lastIndexOf('/');
      let lastSlash = lastBackward > lastForward ? lastBackward : lastForward;
      return this.repoPath.substring(lastSlash + 1);
    }
    return null;
  }

  public async currentCommitHash(): Promise<string> {
    return (await this.run("rev-list HEAD --max-count=1")).stdout.split('\n')[0];
  }

  public async branches(): Promise<Branch[]> {
    return (await Promise.all([
      this.run("branch"),
      this.run("branch -r")
    ]))
      .flatMap((x, i) => x.stdout.split('\n').map(y => { return { name: y, isRemote: i === 1 } }))
      .map(x => {
        let arr = x.name.trim().split(' ');
        let isCurrent = arr[0] === '*';
        return {
          name: isCurrent ? arr[1] : arr[0],
          isCurrent: isCurrent,
          isRemote: x.isRemote
        };
      })
      .filter(x => x.name != '');
  }

  private async assignAllCommits(): Promise<void> {
    this.allCommits = (await this.run(`rev-list --topo-order --all --pretty="%P%n%s%n%cI%n%an"`))
      .stdout
      .split('commit ')
      .splice(1)
      .map((x, i, c) => {
        let rec = x.split('\n');
        return {
          order: i,
          hash: rec[0],
          parentHashes: rec[1].split(' ').filter((v, i, c) => c.indexOf(v) == i),
          message: rec[2],
          date: new Date(rec[3]),
          author: rec[4],
        };
      });
  }

  public async remotes(): Promise<string[]> {
    if (!this.allCommits) await this.assignAllCommits();

    return (await this.run('remote'))
      .stdout
      .split('\n')
      .filter(x => x);
  }

  public async commits(branch?: string): Promise<Commit[]> {
    if (!this.allCommits) await this.assignAllCommits();

    return (await this.run(`rev-list --topo-order ${branch ?? '--all'} --pretty="%P%n%s%n%cI%n%an"`))
      .stdout
      .split('commit ')
      .splice(1)
      .map(x => {
        let rec = x.split('\n');
        return {
          order: this.allCommits.map(x => x.hash).indexOf(rec[0]),
          hash: rec[0],
          parentHashes: rec[1].split(' '),
          message: rec[2],
          date: new Date(rec[3]),
          author: rec[4],
        };
      });
  }

  public async diff(commitHash?: string): Promise<FileInfo[]> {
    let commitTarget = commitHash ? `diff-tree ${commitHash}~ ${commitHash}` : 'diff';
    return Promise.all((await this.run(`${commitTarget} --numstat`))
      .stdout
      .split('\n')
      .filter(x => x != '' && x != ' ')
      .map(async x => {
        let res = x.split('\t').filter(x => x != '' && x != ' ');
        return {
          commitHash: commitHash,
          linesAdded: res[0],
          linesRemoved: res[1],
          filePath: res[2],
          isTracked: true,
          nameStatus: await this.nameStatus(res[2], !commitHash, commitHash),
        } as FileInfo;
      })
    );
  }

  private async nameStatus(filePath: string, staged: boolean, commitHash?: string): Promise<NameStatus> {
    let commitTarget = commitHash ? `${commitHash}~ ${commitHash}` : '';
    let a = (await this.run(`diff ${commitTarget} ${staged ? '--cached ' : ''}--name-status -- ${filePath}`))
      .stdout
      .split('\t')[0] as NameStatus;

    return a;
  }

  private async lsUntracked(): Promise<FileInfo[]> {
    return (await this.run(`ls-files --others --exclude-standard`))
      .stdout
      .split('\n')
      .filter(x => x != '' && x != ' ')
      .map(x => {
        let res = x.split('\t').filter(x => x != '' && x != ' ');
        return {
          linesAdded: '??',
          linesRemoved: '??',
          isTracked: false,
          filePath: res[0],
          isStaged: false,
          nameStatus: 'X',
        };
      });
  }

  public async stage(filePath: string): Promise<string> {
    return (await this.run(`add ${filePath}`)).stdout;
  }

  public async unstage(filePath: string): Promise<string> {
    return (await this.run(`remove ${filePath}`)).stdout;
  }

  public async root(path: string): Promise<string> {
    return (await this.run('rev-parse --show-toplevel', path)).stdout.split('\n')[0];
  }

  public async isRepo(path: string): Promise<boolean> {
    return !(await this.run('-C . rev-parse', path)).stderr;
  }

  public async lsFiles(...paths: string[]): Promise<LsFilesResult[]> {
    return (await this.run(`ls-files -u -s -- ${paths.join(' ')}`))
      .stdout
      .split('\n')
      .filter(x => x)
      .map(x => {
        const arr = x.split('\t').flatMap(y => y.split(' '));
        return {
          mode: arr[0],
          hash: arr[1],
          stage: arr[2], // arr[2] === '1' ? 'base' : arr[2] === '2' ? 'local' : 'remote',
          filePath: arr[3],
        }
      });
  }

  public async getWorkingTree(): Promise<FileInfo[]> {
    //amend? HEAD=HEAD~1
    const rowsRes = (await this.run('diff-index --cached --raw HEAD -C -M --')).stdout + (await this.run('diff-index --raw HEAD -C -M --')).stdout;

    const rows: DiffIndexRawResult[] = (rowsRes)
      .split('\n')
      .filter(x => x)
      .filter((x, i, c) => c.indexOf(x) === i)
      .map(x => {
        const arr = x.substring(1).split(' ').flatMap(y => y.split('\t'));
        return {
          srcMode: arr[0],
          dstMode: arr[1],
          srcHash: arr[2],
          dstHash: arr[3],
          nameStatus: arr[4] as NameStatus,
          filePath: arr[5]
        };
      })
      .filter((x, i, c) => c.map(y => y.filePath).indexOf(x.filePath) === i);

    const numStatsRes = (await this.run('diff-index --cached HEAD --numstat -C -M --')).stdout + (await this.run('diff-index HEAD --numstat -C -M --')).stdout;

    const numStats: DiffIndexNumStatResult[] = (numStatsRes)
      .split('\n')
      .filter(x => x)
      .filter((x, i, c) => c.indexOf(x) === i)
      .map(x => {
        const arr = x.split('\t');
        return {
          addedLines: arr[0],
          deletedLines: arr[1],
          filePath: arr[2],
        };
      })
      .filter((x, i, c) => c.map(y => y.filePath).indexOf(x.filePath) === i);

    const unversioned: FileInfo[] = (await this.run('ls-files . --exclude-standard --others'))
      .stdout
      .split('\n')
      .filter(x => x)
      .map(x => {
        return {
          filePath: x,
          linesAdded: '??',
          linesRemoved: '??',
          commitHash: '',
          isTracked: false,
          nameStatus: 'unversioned'
        };
      });

    return rows
      .map(x => {
        const numStat = numStats.filter(y => y.filePath === x.filePath)[0];
        return {
          filePath: x.filePath,
          linesAdded: numStat?.addedLines,
          linesRemoved: numStat?.deletedLines,
          commitHash: '',
          isTracked: true,
          nameStatus: x.nameStatus
        } as FileInfo;
      })
      .concat(unversioned)
      .sort((x, y) => x.filePath > y.filePath ? 1 : -1);
  }

  private async run(command: string, customPath?: string): Promise<{ stdout: string, stderr: string }> {
    return await this.ipcRenderer.invoke("run-git", customPath ?? this.repoPath, command);
  }
}

export interface DiffIndexRawResult {
  srcMode: string;
  dstMode: string;
  srcHash: string;
  dstHash: string;
  nameStatus: NameStatus;
  filePath: string;
}

export interface DiffIndexNumStatResult {
  addedLines: string;
  deletedLines: string;
  filePath: string;
}

export interface LsFilesResult {
  mode: string;
  hash: string;
  stage: string;
  filePath: string;
}

export function printNameStatus(nameStatus: NameStatus): string {
  switch (nameStatus) {
    case 'A': return 'Added';
    case 'C': return 'Copied';
    case 'D': return 'Deleted';
    case 'M': return 'Modified';
    case 'R': return 'Renamed';
    case 'T': return 'Type-changed';
    case 'U': return 'Unmerged';
    case 'X': return 'Unknown';
    case 'B': return 'Broken';
    case 'unversioned': return 'Unversioned';
  }
}

type NameStatus = 'A' | 'C' | 'D' | 'M' | 'R' | 'T' | 'U' | 'X' | 'B' | 'unversioned';

export interface Commit {
  order: number;
  hash: string;
  parentHashes: string[];
  message: string;
  date: Date;
  author: string;
}

export interface FileInfo {
  filePath: string;
  linesAdded: string;
  linesRemoved: string;
  commitHash?: string;
  isTracked: boolean;
  nameStatus: NameStatus;
}

export type ContextMenuItemActionType = 'open-modal' | 'run-cmd' | 'group' | 'copy' | 'show-in-folder';

export interface ContextMenuItem {
  label: string;
  action: ContextMenuItemActionType;
  actionContent: string;
  path?: string;
  jsonModalData?: string;
  nested: ContextMenuItem[];
}
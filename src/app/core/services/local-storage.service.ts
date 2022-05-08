import { Injectable } from '@angular/core';
import { GitService } from './electron/git.service';

export type LocalStorageKey =
  'all-tabs' |
  'active-tab' |
  'selected-graph-row' |
  'selected-changelist-row' |
  'remote' |
  'current-cherry-picking-commit-target' |
  'cherry-picking-merge-fixing-mode' |
  'is-cherry-picking-in-progress' |
  'current-modal';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor(private gitService: GitService) { }

  public get<T>(storageKey: LocalStorageKey, universal?: boolean): T {
    let key: string = storageKey;
    if (!universal) key = `${storageKey}-${this.gitService.repoPath}`;
    return JSON.parse(localStorage.getItem(key)) as T;
  }

  public set<T>(storageKey: LocalStorageKey, value: T, universal?: boolean): void {
    let key: string = storageKey;
    if (!universal) key = `${storageKey}-${this.gitService.repoPath}`;
    localStorage.setItem(key, JSON.stringify(value));
  }

  public remove(key: LocalStorageKey): void {
    localStorage.removeItem(key);
  }
}

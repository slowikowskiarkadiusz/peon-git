import { EventEmitter, Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import { ipcRenderer, webFrame } from 'electron';
import * as fs from 'fs';
import { CommandOptions } from '../../../../../app/main';
import { ElectronableModalData } from '../../../home/modals/electronable-modal-base/electronable-modal-base.component';
import { OutputModalData } from '../../../home/modals/output-modal/output-modal.component';
import { ContextMenuItem } from './git.service';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private readonly ipcRenderer: typeof ipcRenderer;
  private readonly webFrame: typeof webFrame;
  private readonly childProcess: typeof childProcess;
  private readonly fs: typeof fs;

  public openModal: EventEmitter<ElectronableModalData> = new EventEmitter<ElectronableModalData>();
  public openOutputModal: EventEmitter<OutputModalData> = new EventEmitter<OutputModalData>();

  constructor() {
    if (!!(window?.process?.type)) { // isElectron
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  public registerOpeningModal(): EventEmitter<ElectronableModalData> {
    this.ipcRenderer.on('open-modal', (event, modalData: ElectronableModalData) => {
      this.openModal.emit(modalData);
    });

    return this.openModal;
  }

  public registerOpeningOutputModal(): EventEmitter<OutputModalData> {
    this.ipcRenderer.on('open-output-modal', (event, outputData: OutputModalData) => {
      this.openOutputModal.emit(outputData);
    });

    return this.openOutputModal;
  }

  public setModal(): Promise<object> {
    return new Promise<object>((resolve, reject) => this.ipcRenderer.on('modal-data-out', (event, res: string) => resolve(JSON.parse(res))));
  }

  public setContextMenuCommands(items: ContextMenuItem[]) {
    items.forEach(x => this.ipcRenderer.send('set-context-menu-command-items', items));
  }

  public runCmd(command: string, path: string, options?: CommandOptions): void {
    this.ipcRenderer.send('run-cmd', command, path, options);
  }
}
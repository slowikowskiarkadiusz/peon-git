import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ElectronService } from '../../../core/services';
import { LocalStorageService } from '../../../core/services/local-storage.service';

export interface ElectronableModalData {
  componentName: string;
  repoPath: string;
}

@Component({
  selector: 'app-electronable-modal-base',
  templateUrl: './electronable-modal-base.component.html',
  styleUrls: ['./electronable-modal-base.component.scss']
})
export class ElectronableModalBaseComponent {
  @Input() public btnsToRender: ('help' | 'cancel' | 'submit')[] = ['help', 'cancel', 'submit'];
  @Input() public helpDisabled: boolean = false;
  @Input() public cancelDisabled: boolean = false;
  @Input() public submitDisabled: boolean = false;
  @Input() public autoCloseOnCancel: boolean = true;
  @Input() public autoCloseOnSubmit: boolean = true;

  @Output() public help: EventEmitter<void> = new EventEmitter<void>();
  @Output() public cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() public submit: EventEmitter<void> = new EventEmitter<void>();

  protected baseData: ElectronableModalData;

  constructor(
    protected electronService: ElectronService,
    private electronDialogRef: MatDialogRef<ElectronableModalBaseComponent>) { }

  @HostListener('window:keydown', ['$event'])
  public keyEvent(event: KeyboardEvent) {
    if (Object.getPrototypeOf(this).constructor.name !== 'ElectronableModalBaseComponent') return;

    if (event.key.toLowerCase() == 'enter')
      this._onSubmit();
    else if (event.key.toLowerCase() == 'escape')
      this._onCancel();
  }

  public get doRenderHelp(): boolean {
    return this.btnsToRender.includes('help');
  }

  public get doRenderCancel(): boolean {
    return this.btnsToRender.includes('cancel');
  }

  public get doRenderSubmit(): boolean {
    return this.btnsToRender.includes('submit');
  }

  public _onSubmit(): void {
    this.submit.emit();
    if (this.autoCloseOnSubmit) {
      this.electronDialogRef.close();
    }
  }

  public _onCancel(): void {
    this.cancel.emit();
    if (this.autoCloseOnCancel) {
      this.electronDialogRef.close();
    }
  }

  public nothing(): void { }
}

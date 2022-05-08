import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ElectronService } from '../../../core/services';
import { GitService } from '../../../core/services/electron/git.service';
import { ElectronableModalBaseComponent, ElectronableModalData } from '../electronable-modal-base/electronable-modal-base.component';

export interface OutputModalData extends ElectronableModalData {
  stdout: string;
  stderr: string;
  error: Error;
  preventReload?: boolean;
}

@Component({
  selector: 'app-output-modal',
  templateUrl: './output-modal.component.html',
  styleUrls: ['./output-modal.component.scss']
})
export class OutputModalComponent extends ElectronableModalBaseComponent {
  public stdout: string = null;
  public stderr: string = null;
  public stdoutColor: string = '#0066ff';
  public stderrColor: string = '#cc0000';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: OutputModalData,
    protected electronService: ElectronService,
    private gitService: GitService,
    private title: Title,
    private dialogRef: MatDialogRef<OutputModalComponent>) {
    super(electronService, dialogRef);

    this.title.setTitle(`output`);
  }

  public onHelp(): void { }

  public onCancel(): void {
    this.dialogRef.close(this.data.preventReload);
  }

  public onSubmit(): void {
    this.dialogRef.close(this.data.preventReload);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GitService } from '../../core/services/electron/git.service';
import { TabService } from '../../core/services/tab.service';
import { TabData } from '../tab-content/tab-content.component';

@Component({
  selector: 'app-new-tab',
  templateUrl: './new-tab.component.html',
  styleUrls: ['./new-tab.component.scss']
})
export class NewTabComponent {
  @Input() public tabData: TabData | null;

  @Output() public newTabData: EventEmitter<TabData> = new EventEmitter<TabData>();

  public message: string;

  constructor(
    private gitService: GitService,
    private tabService: TabService) { }

  public async onDirectoryChosen(event: any): Promise<void> {
    if (!this.tabData) this.tabData = {};
    this.tabData.location = null;
    this.message = '';
    let value = event.target.value.trim();

    if (!(window.require('fs').existsSync(value))) {
      this.message = 'The path does not exist';
      return;
    }

    if (!(await this.gitService.isRepo(value))) {
      this.message = 'This is not a git repository directory';
      return;
    }
    else {
      value = await this.gitService.root(value);

      if (this.tabService.getTabDatas().map(x => x.location).filter(x => x).includes(value)) {
        this.message = `There's already a tab for that location`;
        return;
      }

      if (this.tabData.location !== value) {
        this.message = `The root of that repository is: ${value}\nA tab will opened for that directory`;
      }
    }

    this.tabData.location = value.trim();
  }

  public onSubmit(): void {
    if (this.tabData.location)
      this.newTabData.emit(this.tabData);
    else
      console.log("error");
    location.reload();
  }

  public nothing(): void { }
}

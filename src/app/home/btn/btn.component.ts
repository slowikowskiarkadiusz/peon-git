import { Component, Input, OnInit } from '@angular/core';

type ButtonType = 'dflt' | 'gray' | 'none' | 'beige' | 'blue' | 'orange' | 'red' | 'green';

@Component({
  selector: 'app-btn',
  templateUrl: './btn.component.html',
  styleUrls: ['./btn.component.scss',]
})
export class BtnComponent implements OnInit {
  @Input() public borderType: ButtonType = 'none';
  @Input() public backgroundType: ButtonType = 'none';
  @Input() public jiggle: string = '2';
  @Input() public bstyle: string;
  @Input() public bclass: string;
  @Input() public disabled: boolean = false;

  constructor() { }

  public get _class(): string {
    return this.bclass + ' ' +
      this.borderType + '-border-btn' + ' ' +
      this.backgroundType + '-background-btn' + ' ' +
      'jiggle' + this.jiggle + ' ';
  }

  public get disabledClass(): string {
    return this.bclass + ' ' +
      `${this.borderType != 'none' ? 'gray-border-btn' : ''}  ` +
      `${this.backgroundType != 'none' ? 'gray-background-btn' : ''} ` +
      'jiggle' + this.jiggle + ' ';
  }

  ngOnInit(): void { }
}

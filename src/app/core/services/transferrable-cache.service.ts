import { Injectable } from '@angular/core';
import { ElectronService } from './electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class TransferrableCacheService {

  constructor(private electronService: ElectronService) { }

  public get(key: string): any {

  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WhatTheCommitService {

  constructor(private httpClient: HttpClient) { }

  public getMessage(): Observable<string> {
    return this.httpClient.get('http://whatthecommit.com/index.txt', { responseType: 'text' })
      .pipe(
        take(1),
        map(x => x.substring(0, x.length - 1))
      );
  }
}

import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Contribution } from '../schema/contribution';

import { handleError } from './handleError';
import { IpcService } from '@app/service/ipc.service';

@Injectable({
  providedIn: 'root'
})
export class ContributionService {
  constructor(private ipc: IpcService) {}

  getAll(): Observable<Contribution[]> {
    return from(this.ipc.invoke('get-all-contributions')).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }
        console.log(res.data);
        return res.data;
      })
    );
  }
}

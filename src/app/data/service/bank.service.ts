import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { IpcService } from '@app/service/ipc.service';
import { HttpClient } from '@angular/common/http';
import { Bank } from '@data/schema/bank';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  constructor(private http: HttpClient, private ipc: IpcService) {}

  getBanks(): Observable<Bank[]> {
    return from(this.ipc.invoke('get-banks')).pipe(
      map(res => {
        if (res.status === 0) {
          throw new Error(res.message);
        }
        return res.data;
      })
    );
  }
}

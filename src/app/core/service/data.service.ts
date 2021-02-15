import { Injectable } from '@angular/core';
import { AnyCnameRecord } from 'dns';
import { Observable, of, throwError } from 'rxjs';
import data from './json/data.json';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  getData(dataName: string): Observable<any> {
    const result = data[dataName];

    if (typeof result !== 'undefined') return of(result);

    return throwError(`doesn't exist data`);
  }
}

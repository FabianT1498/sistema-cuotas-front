import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import selectsOptions from './json/select-options.json';

@Injectable({
  providedIn: 'root'
})
export class SelectOptionsService {
  getOptions(select: string): Observable<Array<any>> {
    const selectOptions = selectsOptions[select];

    if (typeof selectOptions !== 'undefined') return of(selectOptions);

    return throwError(`doesn't exist select`);
  }
}

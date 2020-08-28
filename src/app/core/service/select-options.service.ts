import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import selectsOptions from './json/select-options.json';

@Injectable({
  providedIn: 'root'
})
export class SelectOptionsService {
  getOptions(select: string): Observable<Array<String>> {
    const selectOptions = selectsOptions.find(el => el.select === select);

    if (selectOptions) return of(selectOptions.options);

    return throwError(`doesn't exist select`);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Contribution } from '../schema/contribution';

import { handleError } from './handleError';

@Injectable({
  providedIn: 'root'
})
export class ContributionService {
  private contributionsUrl = 'api/contributions'; // URL to web api

  constructor(private http: HttpClient) {}

  getAll(): Observable<Contribution[]> {
    return this.http
      .get<Contribution[]>(this.contributionsUrl)
      .pipe(catchError(handleError<Contribution[]>('getAll', [])));
  }
}

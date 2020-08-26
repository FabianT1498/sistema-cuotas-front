import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import pathsLinks from './json/link-routes.json';

@Injectable({
  providedIn: 'root'
})
export class LinkRoutesService {
  getLinks(path: string): Observable<any> {
    const pathLinks = pathsLinks.find(el => el.path === path);

    if (pathLinks) return of(pathLinks.links);

    return throwError(`doesn't exist path in link routes`);
  }
}

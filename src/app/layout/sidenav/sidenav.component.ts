import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { Router, NavigationEnd } from '@angular/router';

import { LinkRoutesService } from '@app/service/link-routes.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  items$: Observable<any>;
  @Input() isOpen: Boolean;

  constructor(
    private router: Router,
    private linkRoutesService: LinkRoutesService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const pathName = event.urlAfterRedirects
          .slice(1)
          .split('/', 1)
          .toString();
        this.items$ = this.linkRoutesService.getLinks(pathName);
      });
  }

  ngOnInit() {}
}

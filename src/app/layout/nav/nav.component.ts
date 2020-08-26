import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { environment } from '@env';
import { Observable } from 'rxjs';
import { ThemeService } from 'app/core/service/theme.service';
import { LinkRoutesService } from 'app/core/service/link-routes.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  public version = environment.version;
  public repoUrl = 'https://github.com/mathisGarberg/angular-folder-structure';
  public isDarkTheme$: Observable<boolean>;
  public items$: Observable<any>;

  private isSidenavOpen: Boolean;
  @Output() ToggleSidenavEvent = new EventEmitter<Boolean>();

  constructor(
    private themeService: ThemeService,
    private linkRoutesService: LinkRoutesService
  ) {
    this.isSidenavOpen = false;
  }

  ngOnInit() {
    this.isDarkTheme$ = this.themeService.getDarkTheme();
    this.items$ = this.linkRoutesService.getLinks('dashboard');
  }

  toggleTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
    this.ToggleSidenavEvent.emit(this.isSidenavOpen);
  }
}

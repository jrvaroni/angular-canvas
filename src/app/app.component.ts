import { Component, inject } from '@angular/core';
import { TokenStorageService } from './services/token-storage.service';
import { IUser } from './models/user';

import { TopMenuComponent } from './shared/components/top-menu/top-menu.component';

import { CommonModule } from '@angular/common';

import { SideMusicMenuComponent } from './shared/components/side-menu/side-menu.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HlmMenuComponent, HlmMenuGroupComponent, HlmMenuItemDirective, HlmMenuSeparatorComponent } from '@spartan-ng/ui-menu-helm';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HlmAlertDialogComponent } from '@spartan-ng/ui-alertdialog-helm';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TopMenuComponent,
    SideMusicMenuComponent,
    HlmMenuComponent,
    HlmMenuGroupComponent,
    HlmMenuItemDirective,
    HlmMenuSeparatorComponent,
    CommonModule,
    ToastComponent,
    HlmAlertDialogComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  private router = inject(Router);
  private _tokenStorage = inject(TokenStorageService);
  private routeSub: Subscription;
  private authSub: Subscription;

  protected loggedUser = false;
  protected isCanvasRoute = true;

  constructor() {
    this.authSub = this._tokenStorage.isLoggedIn$
      .subscribe((isLoggedIn) => {
        this.loggedUser = isLoggedIn;
      });

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isCanvasRoute = event.url.includes('/canvas');
      });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }
  
}

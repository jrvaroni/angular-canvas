import { Component } from '@angular/core';
import { TokenStorageService } from './services/token-storage.service';
import { IUser } from './models/user';

import { TopMenuComponent } from './shared/components/top-menu/top-menu.component';

import { CommonModule } from '@angular/common';

import { SideMusicMenuComponent } from './shared/components/side-menu/side-menu.component';
import { RouterOutlet } from '@angular/router';
import { HlmMenuComponent, HlmMenuGroupComponent, HlmMenuItemDirective, HlmMenuSeparatorComponent } from '@spartan-ng/ui-menu-helm';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HlmAlertDialogComponent } from '@spartan-ng/ui-alertdialog-helm';

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
  
  loggedUser = false

  constructor(private _tokenStorage: TokenStorageService) {
    this._tokenStorage.isLoggedIn$.subscribe((isLoggedIn) => {
      this.loggedUser = isLoggedIn
    })
  }
  
}

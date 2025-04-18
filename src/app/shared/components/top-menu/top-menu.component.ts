import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideBoxSelect, lucideMapPin, lucideUserCog, lucideUser, lucideSword, lucideSwords, lucideLocate, lucideDollarSign, lucideUsers } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { BrnMenuTriggerDirective } from '@spartan-ng/ui-menu-brain';
import {
	HlmMenuBarComponent,
	HlmMenuBarItemDirective,
	HlmMenuComponent,
	HlmMenuGroupComponent,
	HlmMenuItemCheckComponent,
	HlmMenuItemCheckboxDirective,
	HlmMenuItemDirective,
	HlmMenuItemIconDirective,
	HlmMenuItemRadioComponent,
	HlmMenuItemRadioDirective,
	HlmMenuItemSubIndicatorComponent,
	HlmMenuLabelComponent,
	HlmMenuSeparatorComponent,
	HlmMenuShortcutComponent,
	HlmSubMenuComponent,
} from '@spartan-ng/ui-menu-helm';
import { TokenStorageService } from '../../../services/token-storage.service';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'top-menu',
	standalone: true,
	host: {
		class: 'block',
	},
	imports: [
		BrnMenuTriggerDirective,

		HlmMenuComponent,
		HlmMenuBarComponent,
		HlmSubMenuComponent,
		HlmMenuItemDirective,
		HlmMenuItemSubIndicatorComponent,
		HlmMenuLabelComponent,
		HlmMenuShortcutComponent,
		HlmMenuSeparatorComponent,
		HlmMenuItemIconDirective,
		HlmMenuBarItemDirective,
		HlmMenuItemCheckComponent,
		HlmMenuItemRadioComponent,
		HlmMenuGroupComponent,

		HlmButtonDirective,
		HlmMenuItemCheckboxDirective,
		HlmMenuItemRadioDirective,

		HlmIconComponent,
	],
	providers: [provideIcons({ lucideMapPin, lucideUserCog, lucideBoxSelect, lucideUser, lucideSword, lucideSwords, lucideLocate, lucideDollarSign, lucideUsers })],
	templateUrl: './top-menu.component.html'
})
export class TopMenuComponent {

	constructor(private _tokenStorage: TokenStorageService, private router: Router) {}

	logout() {
		this._tokenStorage.signOut();
		this.router.navigate(['/auth/login'])
	}
}
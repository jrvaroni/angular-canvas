import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBox,
  lucideBoxSelect,
  lucideMapPin,
  lucideUserCog,
  lucideUser,
  lucideSword,
  lucideSwords,
  lucideLocate,
  lucideDollarSign,
  lucideUsers,
  lucideHouse,
  lucideClipboardPen,
} from '@ng-icons/lucide';
import { HlmIconComponent } from '@spartan-ng/ui-icon-helm';
import { HlmScrollAreaComponent } from '@spartan-ng/ui-scrollarea-helm';
import { SideMenuButtonComponent } from './side-menu-button.component';
import { RouterLink } from '@angular/router';

interface ListItem {
	text: string;
	icon: string;
	link: string;
	selected?: boolean;
}

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'side-menu',
	standalone: true,
	host: {
		class: 'block',
	},
	imports: [SideMenuButtonComponent, HlmIconComponent, HlmScrollAreaComponent, NgClass, RouterLink],
	providers: [
		provideIcons({
			lucideBox, lucideBoxSelect, lucideClipboardPen, lucideMapPin, lucideUserCog, lucideUser, lucideSword, lucideSwords, lucideLocate, lucideDollarSign, lucideUsers, lucideHouse
		}),
	],
	templateUrl: './side-menu.componen.html'
})
export class SideMusicMenuComponent {

	public menu: ListItem[] = [
		{ text: 'Home', icon: 'lucideHouse', link: '', selected: true },
		{ text: 'Clientes', icon: 'lucideUser', link: 'clientes' },
		{ text: 'Produtos', icon: 'lucideBox', link: 'produtos' },
		{ text: 'Canvas', icon: 'lucideClipboardPen', link: 'canvas' },
	];
}